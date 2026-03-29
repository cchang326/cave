import React, { useState, useEffect, useRef } from 'react';
import { GameState, CaveSpace, ActionBoardState, ChecklistItem, GoodsState } from './types/game';
import { MOCK_TILES, MOCK_ROOM_TILES } from './data/mockTiles';
import { setupSoloActionBoard } from './data/actionTiles';
import { GoodsTrack } from './components/GoodsTrack';
import { CaveBoard } from './components/CaveBoard';
import { ActionBoard } from './components/ActionBoard';
import { CentralDisplay } from './components/CentralDisplay';
import { ChecklistUI } from './components/ChecklistUI';
import { ScoreSummary } from './components/ScoreSummary';
import { DebugPanel, DebugState } from './components/DebugPanel';
import { SelectGoodsModal } from './components/SelectGoodsModal';
import { generateChecklistForAction, getRoomActionChecklistItems } from './utils/checklist';
import { isValidRoomPlacement } from './utils/walls';

function canAfford(goods: GoodsState, cost?: Partial<GoodsState>, ignoreValidation?: boolean): boolean {
  if (ignoreValidation) return true;
  if (!cost) return true;
  for (const key in cost) {
    const k = key as keyof GoodsState;
    if (goods[k] < (cost[k] || 0)) return false;
  }
  return true;
}

function getAccessibleSpaces(cave: CaveSpace[]): string[] {
  const openSpaces = cave.filter(c => ['ENTRANCE', 'EMPTY', 'FURNISHED', 'CROSSED_PICKAXES'].includes(c.state));
  const accessibleIds: string[] = [];

  for (const space of cave) {
    if (space.state === 'FACE_DOWN') {
      const isAdjacent = openSpaces.some(open => {
        const dx = Math.abs(open.col - space.col);
        const dy = Math.abs(open.row - space.row);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
      });
      if (isAdjacent) {
        accessibleIds.push(space.id);
      }
    }
  }
  return accessibleIds;
}

function addGoods(current: GameState['goods'], gains: Partial<GameState['goods']>): GameState['goods'] {
  const next = { ...current };
  for (const key in gains) {
    const k = key as keyof GameState['goods'];
    next[k] = Math.min(9, next[k] + (gains[k] || 0));
  }
  return next;
}

function subtractGoods(current: GameState['goods'], costs: Partial<GameState['goods']>): GameState['goods'] {
  const next = { ...current };
  for (const key in costs) {
    const k = key as keyof GameState['goods'];
    next[k] = Math.max(0, next[k] - (costs[k] || 0));
  }
  return next;
}

function initializeGame(): GameState {
  // Shuffle all 24 mock room tiles
  const allTiles = [...MOCK_ROOM_TILES].sort(() => Math.random() - 0.5);

  const initialCave: CaveSpace[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      if (col === 2 && row !== 4) continue; // Skip the empty spaces in the top right

      let state: CaveSpace['state'] = 'FACE_DOWN';
      let tile = undefined;

      if (row === 3 && col === 0) {
        state = 'ENTRANCE';
        tile = MOCK_TILES.caveEntrance;
      } else if (row === 2 && col === 0) {
        state = 'CROSSED_PICKAXES';
      } else {
        tile = allTiles.pop(); // Take 10 tiles for the cave
      }

      initialCave.push({
        id: `space-${row}-${col}`,
        row,
        col,
        state,
        tile
      });
    }
  }

  const { availableActions, futureActions } = setupSoloActionBoard();
  const firstNewAction = futureActions.shift()!;
  availableActions.push(firstNewAction);

  const initialActionBoard: ActionBoardState = {
    round: 1,
    turn: 1,
    maxTurns: firstNewAction.stage === 2 ? 2 : firstNewAction.stage === 3 ? 3 : 4,
    availableActions,
    futureActions,
    usedActionsThisRound: []
  };

  return {
    goods: {
      wood: 1,
      stone: 1,
      emmer: 1,
      flax: 1,
      food: 1,
      gold: 1
    },
    cave: initialCave,
    walls: [],
    actionBoard: initialActionBoard,
    centralDisplay: allTiles.splice(0, 4), // Take 4 for the display
    roomTileDeck: allTiles, // Remaining 10 in the deck
    uiState: {
      mode: 'IDLE',
      excavationsLeft: 0,
      furnishingsLeft: 0,
      roomActionsLeft: 0,
      wallsLeft: 0,
      wallsToRemoveLeft: 0,
      dynamicCostAmount: 0,
      checklist: []
    }
  };
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [debugState, setDebugState] = useState<DebugState>({ ignoreResourceValidation: false });
  const autoExecutedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (gameState.uiState.checklist.length === 0) {
      autoExecutedRef.current.clear();
    }
  }, [gameState.uiState.checklist.length]);

  const handleTakeAction = (actionId: string) => {
    if (gameState.uiState.mode !== 'IDLE') return;

    setGameState(prev => {
      const checklist = generateChecklistForAction(actionId, prev.actionBoard);
      return {
        ...prev,
        uiState: {
          ...prev.uiState,
          mode: 'RESOLVING_TURN',
          activeActionTile: actionId,
          checklist,
          hasInteractedWithChecklist: false,
          undoSnapshot: JSON.stringify(prev)
        }
      };
    });
  };

  const handleExecuteChecklist = (id: string, isManual: boolean = true) => {
    setGameState(prev => {
      const next = { ...prev };
      next.uiState.hasInteractedWithChecklist = isManual || next.uiState.hasInteractedWithChecklist;
      const checklist = [...next.uiState.checklist];
      const itemIndex = checklist.findIndex(i => i.id === id);
      if (itemIndex === -1) return prev;

      const item = checklist[itemIndex];
      const updatedItem = { ...item };

      // Check if they can furnish before deducting food
      if (item.actionType === 'FURNISH') {
        if (next.centralDisplay.length === 0 || !next.cave.some(s => s.state === 'EMPTY' || s.state === 'CROSSED_PICKAXES')) {
          alert("No rooms available to furnish or no empty spaces in the cave!");
          checklist[itemIndex] = { ...item, status: 'SKIPPED' };
          next.uiState.checklist = checklist;
          return next;
        }
      } else if (item.actionType === 'EXCAVATE') {
        const accessible = getAccessibleSpaces(next.cave);
        if (accessible.length === 0) {
          alert("No accessible spaces to excavate!");
          checklist[itemIndex] = { ...item, status: 'SKIPPED' };
          next.uiState.checklist = checklist;
          return next;
        }
      } else if (item.actionType === 'ROOM_ACTION') {
        const hasRoomActions = next.cave.some(s => s.state === 'FURNISHED' && s.tile?.trigger === 'action');
        if (!hasRoomActions) {
          alert("No rooms with actions available!");
          checklist[itemIndex] = { ...item, status: 'SKIPPED' };
          next.uiState.checklist = checklist;
          return next;
        }
      } else if (item.actionType === 'REMOVE_WALL') {
        if (next.walls.length === 0) {
          alert("No walls to remove!");
          checklist[itemIndex] = { ...item, status: 'SKIPPED' };
          next.uiState.checklist = checklist;
          return next;
        }
      }

      // Handle payBefore for any action type
      if (item.data?.payBefore) {
        const hasEnough = debugState.ignoreResourceValidation || Object.entries(item.data.payBefore).every(([key, value]) => {
          return (next.goods[key as keyof typeof next.goods] || 0) >= (value as number);
        });
        if (!hasEnough) {
          alert("Not enough resources to pay for this action!");
          return prev;
        }
        next.goods = subtractGoods(next.goods, item.data.payBefore);
      }

      if (item.actionType === 'GAIN') {
        if (item.data.replenishUpTo) {
          const diff: Partial<typeof next.goods> = {};
          for (const key of Object.keys(item.data.replenishUpTo)) {
            const k = key as keyof GoodsState;
            const target = (item.data.replenishUpTo as Record<string, number>)[key];
            const current = next.goods[k] || 0;
            if (current < target) {
              diff[k] = target - current;
            }
          }
          next.goods = addGoods(next.goods, diff);
        } else if (item.data.goods) {
          next.goods = addGoods(next.goods, item.data.goods);
        }
        updatedItem.status = 'DONE';
      } else if (item.actionType === 'PAY') {
        const hasEnough = debugState.ignoreResourceValidation || Object.entries(item.data.goods).every(([key, value]) => {
          return (next.goods[key as keyof typeof next.goods] || 0) >= (value as number);
        });
        if (!hasEnough) {
          alert("Not enough resources to pay!");
          return prev;
        }
        next.goods = subtractGoods(next.goods, item.data.goods);
        updatedItem.status = 'DONE';
      } else if (item.actionType === 'EXCAVATE') {
        next.uiState.mode = 'EXCAVATE';
        next.uiState.excavationsLeft = item.data.count;
        updatedItem.status = 'DOING';
      } else if (item.actionType === 'FURNISH') {
        next.uiState.mode = 'FURNISH_SELECT_ROOM';
        next.uiState.furnishingsLeft = item.data.count;
        updatedItem.status = 'DOING';
      } else if (item.actionType === 'ROOM_ACTION') {
        next.uiState.mode = 'ROOM_ACTION';
        next.uiState.roomActionsLeft = item.data.count;
        updatedItem.status = 'DOING';
      } else if (item.actionType === 'BUILD_WALL') {
        next.uiState.mode = 'BUILD_WALL';
        next.uiState.wallsLeft = item.data.count;
        updatedItem.status = 'DOING';
      } else if (item.actionType === 'REMOVE_WALL') {
        next.uiState.mode = 'REMOVE_WALL';
        next.uiState.wallsToRemoveLeft = item.data.count;
        updatedItem.status = 'DOING';
      } else if (item.actionType === 'PAY_DYNAMIC') {
        next.uiState.mode = 'PAY_DYNAMIC';
        next.uiState.dynamicCostAmount = item.data.amount;
        updatedItem.status = 'DOING';
      }

      // Handle exclusive groups
      if (item.exclusiveGroup) {
        checklist.forEach((checkItem, idx) => {
          if (checkItem.id !== item.id && checkItem.exclusiveGroup === item.exclusiveGroup && checkItem.status === 'TODO') {
            checklist[idx] = { ...checkItem, status: 'SKIPPED' };
          }
        });
      }

      checklist[itemIndex] = updatedItem;
      next.uiState.checklist = checklist;
      return next;
    });
  };

  const handleSkipChecklist = (id: string, isManual: boolean = true) => {
    setGameState(prev => {
      const next = { ...prev };
      next.uiState.hasInteractedWithChecklist = isManual || next.uiState.hasInteractedWithChecklist;
      const checklist = [...next.uiState.checklist];
      const itemIndex = checklist.findIndex(i => i.id === id);
      if (itemIndex === -1) return prev;

      const item = checklist[itemIndex];
      if (item.status === 'DOING') {
        next.uiState.mode = 'RESOLVING_TURN';
      }

      checklist[itemIndex] = { ...item, status: 'SKIPPED' as const };
      next.uiState.checklist = checklist;
      return next;
    });
  };

  const handleChooseChecklist = (id: string, optionIndex: number, isManual: boolean = true) => {
    setGameState(prev => {
      const next = { ...prev };
      next.uiState.hasInteractedWithChecklist = isManual || next.uiState.hasInteractedWithChecklist;
      const checklist = [...next.uiState.checklist];
      const itemIndex = checklist.findIndex(i => i.id === id);
      if (itemIndex === -1) return prev;

      const item = checklist[itemIndex];
      const option = item.data.options[optionIndex];

      // Replace the choice item with the sub-items
      // Inherit the optional status from the parent choice if it's optional
      const subItems = option.items.map((subItem: ChecklistItem) => ({
        ...subItem,
        optional: item.optional || subItem.optional
      }));

      checklist.splice(itemIndex, 1, ...subItems);

      return { ...next, uiState: { ...next.uiState, checklist } };
    });
  };

  useEffect(() => {
    if (gameState.uiState.mode !== 'RESOLVING_TURN') return;

    const todos = gameState.uiState.checklist.filter(i => i.status === 'TODO');
    const doings = gameState.uiState.checklist.filter(i => i.status === 'DOING');

    if (doings.length > 0) return; // Wait for current action to finish

    // Auto-choose if there's a CHOICE with only 1 viable option and it's NOT optional
    const choiceItem = todos.find(i => i.actionType === 'CHOICE');
    if (choiceItem && !choiceItem.optional) {
      const viableOptions = choiceItem.data.options.map((opt: any, idx: number) => ({ opt, idx }))
        .filter(({ opt }: any) => canAfford(gameState.goods, opt.cost, debugState.ignoreResourceValidation));
      
      if (viableOptions.length === 1) {
        handleChooseChecklist(choiceItem.id, viableOptions[0].idx, false);
        return;
      }
    }

    // Auto-execute the first TODO item if it's not a CHOICE and it's not optional
    // OR if it's the only TODO item left.
    if (todos.length > 0) {
      const item = todos[0];
      if (item.actionType !== 'CHOICE') {
        if (autoExecutedRef.current.has(item.id)) return;

        const cost = item.actionType === 'PAY' ? item.data?.goods : item.data?.payBefore;
        const affordable = canAfford(gameState.goods, cost, debugState.ignoreResourceValidation);
        
        if (affordable && !item.optional) {
          autoExecutedRef.current.add(item.id);
          // Use a slight timeout to allow UI to render the checklist before auto-executing
          // This prevents the UI from feeling too jarring
          const timer = setTimeout(() => {
            handleExecuteChecklist(item.id, false);
          }, 100);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [gameState.uiState.checklist, gameState.uiState.mode, gameState.goods, debugState.ignoreResourceValidation]);

  const handleFinishTurn = () => {
    setGameState(prev => {
      const nextState = { ...prev };
      const board = nextState.actionBoard;
      const actionId = nextState.uiState.activeActionTile!;
      
      const newUsed = [...board.usedActionsThisRound, actionId];
      
      let newTurn = board.turn + 1;
      let newRound = board.round;
      let newMaxTurns = board.maxTurns;
      let newAvailable = [...board.availableActions];
      let newFuture = [...board.futureActions];
      let nextUsed: string[] = newUsed;

      let nextMode: GameState['uiState']['mode'] = 'IDLE';

      if (newTurn > board.maxTurns) {
        if (newFuture.length === 0) {
          nextMode = 'GAME_OVER';
        } else {
          newRound++;
          newTurn = 1;
          const nextAction = newFuture.shift()!;
          newAvailable.push(nextAction);
          newMaxTurns = nextAction.stage === 2 ? 2 : nextAction.stage === 3 ? 3 : 4;
          nextUsed = [];
        }
      }

      nextState.actionBoard = {
        round: newRound,
        turn: newTurn,
        maxTurns: newMaxTurns,
        availableActions: newAvailable,
        futureActions: newFuture,
        usedActionsThisRound: nextUsed
      };

      nextState.uiState = {
        mode: nextMode,
        excavationsLeft: 0,
        furnishingsLeft: 0,
        roomActionsLeft: 0,
        wallsLeft: 0,
        wallsToRemoveLeft: 0,
        dynamicCostAmount: 0,
        checklist: [],
        activeActionTile: undefined
      };

      return nextState;
    });
  };

  const checkCompletion = (nextState: GameState) => {
    if (nextState.uiState.mode === 'EXCAVATE' && nextState.uiState.excavationsLeft <= 0) {
      nextState.uiState.mode = 'RESOLVING_TURN';
      const itemIndex = nextState.uiState.checklist.findIndex(i => i.status === 'DOING' && i.actionType === 'EXCAVATE');
      if (itemIndex !== -1) {
        const doingItem = { ...nextState.uiState.checklist[itemIndex], status: 'DONE' as const };
        nextState.uiState.checklist[itemIndex] = doingItem;
        if (doingItem.data?.gainAfter) {
          nextState.goods = addGoods(nextState.goods, doingItem.data.gainAfter);
        }
      }
    } else if ((nextState.uiState.mode === 'FURNISH_SELECT_ROOM' || nextState.uiState.mode === 'FURNISH_SELECT_SPACE') && nextState.uiState.furnishingsLeft <= 0) {
      nextState.uiState.mode = 'RESOLVING_TURN';
      const itemIndex = nextState.uiState.checklist.findIndex(i => i.status === 'DOING' && i.actionType === 'FURNISH');
      if (itemIndex !== -1) {
        const doingItem = { ...nextState.uiState.checklist[itemIndex], status: 'DONE' as const };
        nextState.uiState.checklist[itemIndex] = doingItem;
        if (doingItem.data?.gainAfter) {
          nextState.goods = addGoods(nextState.goods, doingItem.data.gainAfter);
        }
      }
    } else if (nextState.uiState.mode === 'ROOM_ACTION' && nextState.uiState.roomActionsLeft <= 0) {
      nextState.uiState.mode = 'RESOLVING_TURN';
      const itemIndex = nextState.uiState.checklist.findIndex(i => i.status === 'DOING' && i.actionType === 'ROOM_ACTION');
      if (itemIndex !== -1) {
        const doingItem = { ...nextState.uiState.checklist[itemIndex], status: 'DONE' as const };
        nextState.uiState.checklist[itemIndex] = doingItem;
        if (doingItem.data?.gainAfter) {
          nextState.goods = addGoods(nextState.goods, doingItem.data.gainAfter);
        }
      }
    } else if (nextState.uiState.mode === 'BUILD_WALL' && nextState.uiState.wallsLeft <= 0) {
      nextState.uiState.mode = 'RESOLVING_TURN';
      const itemIndex = nextState.uiState.checklist.findIndex(i => i.status === 'DOING' && i.actionType === 'BUILD_WALL');
      if (itemIndex !== -1) {
        const doingItem = { ...nextState.uiState.checklist[itemIndex], status: 'DONE' as const };
        nextState.uiState.checklist[itemIndex] = doingItem;
        if (doingItem.data?.gainAfter) {
          nextState.goods = addGoods(nextState.goods, doingItem.data.gainAfter);
        }
      }
    } else if (nextState.uiState.mode === 'REMOVE_WALL' && nextState.uiState.wallsToRemoveLeft <= 0) {
      nextState.uiState.mode = 'RESOLVING_TURN';
      const itemIndex = nextState.uiState.checklist.findIndex(i => i.status === 'DOING' && i.actionType === 'REMOVE_WALL');
      if (itemIndex !== -1) {
        const doingItem = { ...nextState.uiState.checklist[itemIndex], status: 'DONE' as const };
        nextState.uiState.checklist[itemIndex] = doingItem;
        // gainAfter is handled in handleWallClick for REMOVE_WALL because it's per-wall
      }
    }
  };

  const handleRoomClick = (roomId: string) => {
    setGameState(prev => {
      if (prev.uiState.mode === 'FURNISH_SELECT_ROOM') {
        const room = prev.centralDisplay.find(r => r.id === roomId);
        if (!room) return prev;

        const itemIndex = prev.uiState.checklist.findIndex(i => i.status === 'DOING' && i.actionType === 'FURNISH');
        const isFree = itemIndex !== -1 && prev.uiState.checklist[itemIndex].data?.freeFurnish;

        // Check if user has enough resources
        const hasEnough = debugState.ignoreResourceValidation || isFree || Object.entries(room.cost).every(([key, value]) => {
          return (prev.goods[key as keyof typeof prev.goods] || 0) >= (value as number);
        });

        if (!hasEnough) {
          alert(`Not enough resources to furnish ${room.name}!`);
          return prev;
        }

        return {
          ...prev,
          uiState: { ...prev.uiState, mode: 'FURNISH_SELECT_SPACE', selectedRoomId: roomId }
        };
      }
      return prev;
    });
  };

  const handleSpaceClick = (spaceId: string) => {
    setGameState(prev => {
      const nextState = { ...prev, uiState: { ...prev.uiState, hasInteractedWithChecklist: true }, cave: [...prev.cave], centralDisplay: [...prev.centralDisplay], goods: { ...prev.goods } };
      nextState.uiState.checklist = [...prev.uiState.checklist];

      if (prev.uiState.mode === 'EXCAVATE') {
        if (prev.uiState.excavationsLeft <= 0) return prev;

        const accessible = getAccessibleSpaces(prev.cave);
        if (!accessible.includes(spaceId)) return prev;

        const spaceIndex = prev.cave.findIndex(s => s.id === spaceId);
        const space = prev.cave[spaceIndex];

        nextState.cave[spaceIndex] = { ...space, state: 'EMPTY', tile: undefined };

        if (space.tile) {
          nextState.centralDisplay.push(space.tile);
        }

        // Draw a new room tile from the deck and add to central display
        if (nextState.roomTileDeck.length > 0) {
          const drawnTile = nextState.roomTileDeck.shift();
          if (drawnTile) {
            nextState.centralDisplay.push(drawnTile);
          }
        }

        nextState.uiState.excavationsLeft -= 1;
        
        const itemIndex = nextState.uiState.checklist.findIndex(i => i.status === 'DOING' && i.actionType === 'EXCAVATE');
        if (itemIndex !== -1) {
          const doingItem = { ...nextState.uiState.checklist[itemIndex] };
          if (doingItem.data) {
            doingItem.data = { ...doingItem.data, count: nextState.uiState.excavationsLeft };
          }
          nextState.uiState.checklist[itemIndex] = doingItem;
        }

        checkCompletion(nextState);
        return nextState;
      } 
      
      if (prev.uiState.mode === 'FURNISH_SELECT_SPACE') {
        const spaceIndex = prev.cave.findIndex(s => s.id === spaceId);
        const space = prev.cave[spaceIndex];

        if (space.state !== 'EMPTY' && space.state !== 'CROSSED_PICKAXES') return prev;
        if (!prev.uiState.selectedRoomId) return prev;

        const roomIndex = prev.centralDisplay.findIndex(r => r.id === prev.uiState.selectedRoomId);
        if (roomIndex === -1) return prev;

        const roomToPlace = prev.centralDisplay[roomIndex];
        
        // Validate wall requirements
        if (!isValidRoomPlacement(space.row, space.col, prev.walls, roomToPlace.wallRequirement)) {
          return prev;
        }

        // Deduct cost
        const itemIndex = prev.uiState.checklist.findIndex(i => i.status === 'DOING' && i.actionType === 'FURNISH');
        const isFree = itemIndex !== -1 && prev.uiState.checklist[itemIndex].data?.freeFurnish;
        if (!isFree) {
          nextState.goods = subtractGoods(nextState.goods, roomToPlace.cost);
        }

        // Remove from display
        nextState.centralDisplay.splice(roomIndex, 1);

        // Add to cave
        nextState.cave[spaceIndex] = { ...space, state: 'FURNISHED', tile: roomToPlace };

        if (roomToPlace.trigger === 'immediate') {
          if (roomToPlace.id === 'parlor') {
            nextState.goods = addGoods(nextState.goods, { food: 2 });
          } else if (roomToPlace.id === 'supply_room') {
            nextState.goods = addGoods(nextState.goods, { wood: 1, stone: 1, emmer: 1, flax: 1 });
          } else if (roomToPlace.id === 'dining_room') {
            nextState.goods = addGoods(nextState.goods, { food: 3 });
          } else if (roomToPlace.id === 'guest_room') {
            nextState.goods = addGoods(nextState.goods, { gold: 2 });
          } else if (roomToPlace.id === 'builders_parlor') {
            nextState.uiState.checklist.unshift({
              id: `builders_parlor_${Date.now()}`,
              text: 'Build up to 2 Walls',
              status: 'TODO',
              actionType: 'BUILD_WALL',
              optional: true,
              data: { count: 2 }
            });
          }
        }

        nextState.uiState.furnishingsLeft -= 1;
        
        const furnishItemIndex = nextState.uiState.checklist.findIndex(i => i.status === 'DOING' && i.actionType === 'FURNISH');
        if (furnishItemIndex !== -1) {
          const doingItem = { ...nextState.uiState.checklist[furnishItemIndex] };
          if (doingItem.data) {
            doingItem.data = { ...doingItem.data, count: nextState.uiState.furnishingsLeft };
          }
          nextState.uiState.checklist[furnishItemIndex] = doingItem;
        }

        if (nextState.uiState.furnishingsLeft > 0) {
          nextState.uiState.mode = 'FURNISH_SELECT_ROOM';
        }
        nextState.uiState.selectedRoomId = undefined;
        checkCompletion(nextState);
        return nextState;
      }

      if (prev.uiState.mode === 'ROOM_ACTION') {
        const spaceIndex = prev.cave.findIndex(s => s.id === spaceId);
        const space = prev.cave[spaceIndex];

        if (space.state !== 'FURNISHED' || !space.tile || space.tile.trigger !== 'action') {
          return prev;
        }

        // Apply room action effect
        const newItems = getRoomActionChecklistItems(space.tile.id);
        
        if (newItems.length > 0) {
          // Insert new items right after the current ROOM_ACTION item
          const itemIndex = nextState.uiState.checklist.findIndex(i => i.status === 'DOING' && i.actionType === 'ROOM_ACTION');
          if (itemIndex !== -1) {
            nextState.uiState.checklist.splice(itemIndex + 1, 0, ...newItems);
          } else {
            nextState.uiState.checklist.unshift(...newItems);
          }
        } else {
          alert(`Action for ${space.tile.name} not implemented yet.`);
          return prev;
        }

        nextState.uiState.roomActionsLeft -= 1;
        
        const itemIndex = nextState.uiState.checklist.findIndex(i => i.status === 'DOING' && i.actionType === 'ROOM_ACTION');
        if (itemIndex !== -1) {
          const doingItem = { ...nextState.uiState.checklist[itemIndex] };
          if (doingItem.data) {
            doingItem.data = { ...doingItem.data, count: nextState.uiState.roomActionsLeft };
          }
          nextState.uiState.checklist[itemIndex] = doingItem;
        }

        checkCompletion(nextState);
        return nextState;
      }

      return prev;
    });
  };

  const handleWallClick = (wallId: string) => {
    if (gameState.uiState.mode !== 'BUILD_WALL' && gameState.uiState.mode !== 'REMOVE_WALL') return;

    setGameState(prev => {
      const nextState = { ...prev, uiState: { ...prev.uiState, hasInteractedWithChecklist: true } };
      
      if (prev.uiState.mode === 'BUILD_WALL') {
        if (nextState.walls.includes(wallId)) return prev;

        nextState.walls = [...nextState.walls, wallId];
        nextState.uiState.wallsLeft -= 1;

        const checklist = [...nextState.uiState.checklist];
        const itemIndex = checklist.findIndex(i => i.actionType === 'BUILD_WALL' && i.status === 'DOING');
        
        if (itemIndex !== -1) {
          checklist[itemIndex] = { 
            ...checklist[itemIndex], 
            data: { ...checklist[itemIndex].data, count: nextState.uiState.wallsLeft } 
          };
        }
        
        nextState.uiState.checklist = checklist;
        checkCompletion(nextState);
        return nextState;
      } else if (prev.uiState.mode === 'REMOVE_WALL') {
        if (!nextState.walls.includes(wallId)) return prev;

        nextState.walls = nextState.walls.filter(w => w !== wallId);
        nextState.uiState.wallsToRemoveLeft -= 1;

        const checklist = [...nextState.uiState.checklist];
        const itemIndex = checklist.findIndex(i => i.actionType === 'REMOVE_WALL' && i.status === 'DOING');
        
        if (itemIndex !== -1) {
          const item = checklist[itemIndex];
          if (item.data?.gainAfter) {
            nextState.goods = addGoods(nextState.goods, item.data.gainAfter);
          }
          checklist[itemIndex] = { 
            ...item, 
            data: { ...item.data, count: nextState.uiState.wallsToRemoveLeft } 
          };
        }
        
        nextState.uiState.checklist = checklist;
        checkCompletion(nextState);
        return nextState;
      }

      return nextState;
    });
  };

  const accessibleSpaces = gameState.uiState.mode === 'EXCAVATE' ? getAccessibleSpaces(gameState.cave) : [];

  const handleUndoAction = () => {
    if (gameState.uiState.undoSnapshot) {
      setGameState(JSON.parse(gameState.uiState.undoSnapshot));
    }
  };

  const handleCancelItem = () => {
    setGameState(prev => {
      const nextState = { ...prev, uiState: { ...prev.uiState }, goods: { ...prev.goods } };
      const checklist = [...nextState.uiState.checklist];
      const itemIndex = checklist.findIndex(i => i.status === 'DOING');
      
      if (itemIndex !== -1) {
        const item = checklist[itemIndex];
        // Refund payBefore if it exists
        if (item.data?.payBefore) {
          nextState.goods = addGoods(nextState.goods, item.data.payBefore);
        }
        checklist[itemIndex] = { ...item, status: 'TODO' };

        // Restore exclusive group items
        if (item.exclusiveGroup) {
          checklist.forEach((checkItem, idx) => {
            if (checkItem.id !== item.id && checkItem.exclusiveGroup === item.exclusiveGroup && checkItem.status === 'SKIPPED') {
              checklist[idx] = { ...checkItem, status: 'TODO' };
            }
          });
        }
      }
      
      nextState.uiState.checklist = checklist;
      nextState.uiState.mode = 'RESOLVING_TURN';
      nextState.uiState.excavationsLeft = 0;
      nextState.uiState.furnishingsLeft = 0;
      nextState.uiState.roomActionsLeft = 0;
      nextState.uiState.wallsLeft = 0;
      nextState.uiState.wallsToRemoveLeft = 0;
      nextState.uiState.dynamicCostAmount = 0;
      nextState.uiState.selectedRoomId = undefined;
      
      return nextState;
    });
  };

  const selectedRoomTile = gameState.uiState.selectedRoomId 
    ? gameState.centralDisplay.find(r => r.id === gameState.uiState.selectedRoomId) 
    : undefined;

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-4 md:p-8 font-sans flex flex-col">
      <div className="max-w-[1400px] mx-auto w-full space-y-6 flex-1 flex flex-col">
        {gameState.uiState.mode === 'GAME_OVER' && (
          <ScoreSummary 
            gameState={gameState} 
            onPlayAgain={() => setGameState(initializeGame())} 
          />
        )}
        {gameState.uiState.mode === 'PAY_DYNAMIC' && (
          <SelectGoodsModal
            goods={gameState.goods}
            amount={gameState.uiState.dynamicCostAmount}
            mustBeDifferent={true} // Junction Room requires different goods
            onConfirm={(selected) => {
              setGameState(prev => {
                const nextState = { ...prev };
                nextState.goods = subtractGoods(nextState.goods, selected);
                
                const itemIndex = nextState.uiState.checklist.findIndex(i => i.status === 'DOING' && i.actionType === 'PAY_DYNAMIC');
                if (itemIndex !== -1) {
                  const item = nextState.uiState.checklist[itemIndex];
                  nextState.uiState.checklist[itemIndex] = { ...item, status: 'DONE' };
                  
                  if (item.data?.gainAfter) {
                    if (item.data.replenishUpToGainAfter) {
                      const diff: Partial<typeof nextState.goods> = {};
                      for (const key of Object.keys(item.data.gainAfter)) {
                        const k = key as keyof GoodsState;
                        const target = (item.data.gainAfter as Record<string, number>)[key];
                        const current = nextState.goods[k] || 0;
                        if (current < target) {
                          diff[k] = target - current;
                        }
                      }
                      nextState.goods = addGoods(nextState.goods, diff);
                    } else {
                      nextState.goods = addGoods(nextState.goods, item.data.gainAfter);
                    }
                  }
                }
                
                nextState.uiState.mode = 'RESOLVING_TURN';
                return nextState;
              });
            }}
            onCancel={handleCancelItem}
          />
        )}
        <header className="border-b border-stone-700 pb-4 flex justify-between items-end shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-orange-400 tracking-tight">Caverna: Cave vs. Cave</h1>
            <p className="text-stone-400">Solo Implementation</p>
          </div>
          <div className="flex items-center gap-4">
            {gameState.uiState.mode === 'EXCAVATE' && (
              <div className="flex items-center gap-2">
                <div className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-lg border border-orange-500/50 font-bold animate-pulse">
                  Select a tile to excavate! ({gameState.uiState.excavationsLeft} left)
                </div>
                <button onClick={handleCancelItem} className="px-3 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded border border-stone-500 text-sm font-bold">Cancel</button>
              </div>
            )}
            {gameState.uiState.mode === 'FURNISH_SELECT_ROOM' && (
              <div className="flex items-center gap-2">
                <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/50 font-bold animate-pulse">
                  Select a room from the Central Display to furnish! ({gameState.uiState.furnishingsLeft} left)
                </div>
                <button onClick={handleCancelItem} className="px-3 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded border border-stone-500 text-sm font-bold">Cancel</button>
              </div>
            )}
            {gameState.uiState.mode === 'FURNISH_SELECT_SPACE' && (
              <div className="flex items-center gap-2">
                <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/50 font-bold animate-pulse">
                  Select an empty space in your cave to place the room!
                </div>
                <button onClick={() => setGameState(prev => ({...prev, uiState: {...prev.uiState, mode: 'FURNISH_SELECT_ROOM', selectedRoomId: undefined}}))} className="px-3 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded border border-stone-500 text-sm font-bold">Back</button>
              </div>
            )}
            {gameState.uiState.mode === 'ROOM_ACTION' && (
              <div className="flex items-center gap-2">
                <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/50 font-bold animate-pulse">
                  Select a furnished room in your cave to use its action! ({gameState.uiState.roomActionsLeft} left)
                </div>
                <button onClick={handleCancelItem} className="px-3 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded border border-stone-500 text-sm font-bold">Cancel</button>
              </div>
            )}
            {gameState.uiState.mode === 'BUILD_WALL' && (
              <div className="flex items-center gap-2">
                <div className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-lg border border-orange-500/50 font-bold animate-pulse">
                  Click between spaces to build a wall! ({gameState.uiState.wallsLeft} left)
                </div>
                <button onClick={handleCancelItem} className="px-3 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded border border-stone-500 text-sm font-bold">Cancel</button>
              </div>
            )}
            {gameState.uiState.mode === 'REMOVE_WALL' && (
              <div className="flex items-center gap-2">
                <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg border border-red-500/50 font-bold animate-pulse">
                  Click a wall to remove it! ({gameState.uiState.wallsToRemoveLeft} left)
                </div>
                <button onClick={handleCancelItem} className="px-3 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded border border-stone-500 text-sm font-bold">Cancel</button>
              </div>
            )}
            <button 
              onClick={() => setGameState(initializeGame())}
              className="text-sm bg-stone-800 hover:bg-stone-700 px-4 py-2 rounded border border-stone-600 transition-colors"
            >
              Restart Game
            </button>
          </div>
        </header>

        <main className="flex flex-col gap-6 flex-1">
          {/* Top Stripe: Action Board */}
          <section className="shrink-0 flex gap-6">
            <div className="flex-1">
              <ActionBoard 
                board={gameState.actionBoard} 
                onTakeAction={handleTakeAction} 
              />
            </div>
            {gameState.uiState.mode !== 'IDLE' && gameState.uiState.checklist.length > 0 && (
              <div className="w-80 shrink-0">
                <ChecklistUI 
                  checklist={gameState.uiState.checklist}
                  goods={gameState.goods}
                  ignoreResourceValidation={debugState.ignoreResourceValidation}
                  onExecute={handleExecuteChecklist}
                  onSkip={handleSkipChecklist}
                  onChoose={handleChooseChecklist}
                  onFinishTurn={handleFinishTurn}
                  onUndoAction={handleUndoAction}
                  canUndoAction={!gameState.uiState.hasInteractedWithChecklist && !!gameState.uiState.undoSnapshot}
                />
              </div>
            )}
          </section>

          {/* Bottom Area: Goods (Left) + Cave (Center) + Display (Right) */}
          <section className="flex flex-col xl:flex-row gap-8 items-start flex-1 overflow-hidden">
            <div className="w-full xl:w-24 shrink-0">
              <GoodsTrack goods={gameState.goods} />
            </div>
            
            <div className="shrink-0 overflow-auto pb-8">
              <CaveBoard 
                cave={gameState.cave} 
                walls={gameState.walls}
                isExcavating={gameState.uiState.mode === 'EXCAVATE'}
                isFurnishing={gameState.uiState.mode === 'FURNISH_SELECT_SPACE'}
                isRoomAction={gameState.uiState.mode === 'ROOM_ACTION'}
                isBuildingWall={gameState.uiState.mode === 'BUILD_WALL'}
                isRemovingWall={gameState.uiState.mode === 'REMOVE_WALL'}
                accessibleSpaces={accessibleSpaces}
                selectedRoomTile={selectedRoomTile}
                onSpaceClick={handleSpaceClick}
                onWallClick={handleWallClick}
              />
            </div>

            <div className="flex-1 overflow-auto pb-8 min-w-[300px] h-full">
              <CentralDisplay 
                tiles={gameState.centralDisplay} 
                isSelectable={gameState.uiState.mode === 'FURNISH_SELECT_ROOM'}
                onRoomClick={handleRoomClick}
              />
            </div>
          </section>
        </main>
      </div>
      <DebugPanel debugState={debugState} setDebugState={setDebugState} gameState={gameState} setGameState={setGameState} />
    </div>
  );
}
