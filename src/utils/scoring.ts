import { GameState } from '../types/game';

export interface ScoreDetails {
  baseVP: number;
  goldVP: number;
  bonusVP: number;
  totalVP: number;
  bonusDetails: { name: string; vp: number }[];
}

export function calculateScore(gameState: GameState): ScoreDetails {
  const furnishedRooms = gameState.cave
    .filter(space => space.state === 'FURNISHED' && space.tile)
    .map(space => space.tile!);

  const baseVP = furnishedRooms.reduce((sum, room) => sum + room.vp, 0);
  const goldVP = gameState.goods.gold;

  let bonusVP = 0;
  const bonusDetails: { name: string; vp: number }[] = [];

  furnishedRooms.filter(r => r.color === 'blue').forEach(room => {
    let vp = 0;
    switch (room.id) {
      case 'treasure_chamber':
        vp = gameState.goods.gold; // 1 VP per 1 Gold
        break;
      case 'food_chamber':
        vp = Math.floor(gameState.goods.food / 3) * 2; // 2 VP per 3 Food
        break;
      case 'prayer_room':
        const emptySpaces = gameState.cave.filter(s => s.state === 'EMPTY' || s.state === 'CROSSED_PICKAXES').length;
        if (emptySpaces === 0) vp = 3; // 3 VP if no empty spaces
        break;
      case 'mining_cave':
        vp = Math.floor(gameState.goods.stone / 2); // 1 VP per 2 Stone
        break;
      case 'gold_stash':
        vp = Math.floor(gameState.goods.gold / 3) * 2; // 2 VP per 3 Gold
        break;
      case 'weapon_room':
        vp = Math.floor(gameState.goods.wood / 2); // 1 VP per 2 Wood
        break;
      case 'storage_cave':
        vp = Math.floor(gameState.goods.emmer / 3); // 1 VP per 3 Emmer
        break;
      case 'sleeping_parlor':
        if (gameState.goods.food >= 5) vp = 2; // 2 VP if >= 5 Food
        break;
    }

    if (vp > 0) {
      bonusVP += vp;
      bonusDetails.push({ name: room.name, vp });
    }
  });

  const totalVP = baseVP + goldVP + bonusVP;

  return { baseVP, goldVP, bonusVP, totalVP, bonusDetails };
}
