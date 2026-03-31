import React, { useState } from 'react';
import { Settings, X, Trophy } from 'lucide-react';
import { GameState, RoomTile } from '../types/game';
import { calculateScore } from '../utils/scoring';
import { MOCK_ROOM_TILES } from '../data/mockTiles';

export interface DebugState {
  // No state needed for now, but keeping the interface for consistency
}

interface Props {
  debugState: DebugState;
  setDebugState: React.Dispatch<React.SetStateAction<DebugState>>;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const DebugPanel: React.FC<Props> = ({ debugState, setDebugState, gameState, setGameState }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentScore = calculateScore(gameState);

  const handleMaxOutResources = () => {
    setGameState(prev => ({
      ...prev,
      goods: {
        wood: 9,
        stone: 9,
        emmer: 9,
        flax: 9,
        food: 9,
        gold: 19
      }
    }));
  };

  const handleDebugExcavateAll = () => {
    setGameState(prev => {
      const hiddenTiles: RoomTile[] = [];
      
      // 1. Excavate all FACE_DOWN spaces to EMPTY and collect their tiles
      const newCave = prev.cave.map(space => {
        if (space.state === 'FACE_DOWN') {
          if (space.tile) {
            hiddenTiles.push(space.tile);
          }
          return { ...space, state: 'EMPTY' as const, tile: undefined };
        }
        return space;
      });

      // 2. Find all tiles currently furnished in the cave
      const tilesInCave = new Set(
        newCave
          .filter(s => s.state === 'FURNISHED' || s.state === 'ENTRANCE')
          .filter(s => s.tile)
          .map(s => s.tile!.id)
      );

      // 3. Central display should have its current tiles + hidden tiles from cave + all tiles from deck
      // We filter by MOCK_ROOM_TILES to ensure we have all possible tiles that are NOT in the cave
      const newCentralDisplay = MOCK_ROOM_TILES.filter(tile => !tilesInCave.has(tile.id));

      return {
        ...prev,
        cave: newCave,
        centralDisplay: newCentralDisplay,
        roomTileDeck: []
      };
    });
  };

  const handleTriggerAdditionalCavern = () => {
    setGameState(prev => ({
      ...prev,
      uiState: {
        ...prev.uiState,
        showAdditionalCavernChoice: true
      }
    }));
  };

  const handleToggleIconicDescription = () => {
    setGameState(prev => ({
      ...prev,
      uiState: {
        ...prev.uiState,
        showIconicDescription: !prev.uiState.showIconicDescription
      }
    }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-stone-800 p-3 rounded-full border border-stone-600 shadow-lg hover:bg-stone-700 transition-colors z-50 group"
        title="Open Debug Panel"
      >
        <Settings className="w-6 h-6 text-stone-400 group-hover:text-stone-200 transition-colors" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-stone-800 rounded-xl shadow-2xl border border-stone-600 z-50 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-stone-700 bg-stone-900/80">
        <h3 className="font-bold text-stone-200 flex items-center gap-2">
          <Settings className="w-4 h-4 text-orange-500" /> Debug Panel
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-5 space-y-6">
        <div className="bg-stone-900/50 p-4 rounded-lg border border-stone-700">
          <div className="flex items-center gap-2 mb-2 text-stone-300">
            <Trophy className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-sm uppercase tracking-wider">Current Score</span>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-xs text-stone-500 space-y-1">
              <div>Rooms: {currentScore.baseVP}</div>
              <div>Gold: {currentScore.goldVP}</div>
              <div>Bonus: {currentScore.bonusVP}</div>
            </div>
            <div className="text-3xl font-black text-orange-400">{currentScore.totalVP}</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-stone-900/50 rounded-lg border border-stone-700">
          <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">Iconic Descriptions</span>
          <button
            onClick={handleToggleIconicDescription}
            className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${
              gameState.uiState.showIconicDescription 
                ? 'bg-green-600 text-white shadow-inner' 
                : 'bg-stone-700 text-stone-400'
            }`}
          >
            {gameState.uiState.showIconicDescription ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="pt-4 border-t border-stone-700 space-y-2">
          <button
            onClick={handleMaxOutResources}
            className="w-full py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg text-sm font-bold transition-colors"
          >
            Max out Resource
          </button>
          <button
            onClick={handleDebugExcavateAll}
            className="w-full py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg text-sm font-bold transition-colors"
          >
            Excavate All
          </button>
          {!gameState.hasAdditionalCavern && (
            <button
              onClick={handleTriggerAdditionalCavern}
              className="w-full py-2 bg-orange-900/40 hover:bg-orange-900/60 text-orange-200 border border-orange-800/50 rounded-lg text-sm font-bold transition-colors"
            >
              Trigger Add. Cavern
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
