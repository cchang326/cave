import { ActionTile } from '../types/game';

export const STARTING_ACTIONS: ActionTile[] = [
  { id: 'cultivation', name: 'Cultivation', stage: 0, description: 'Activate 1 orange room AND/OR Gain up to 2 emmer AND/OR Gain 1 flax', iconicDescription: '[1] \n +2[emmer] +1[flax]' },
  { id: 'housework', name: 'Housework', stage: 0, description: 'Pay food equal to the number of turns this round to furnish a cavern AND/OR Pay either 5 food or 1 gold to furnish a cavern', iconicDescription: '?[food] [arrow-right] [furnish] \n 5[food] | 1[gold] [arrow-right] [furnish]' },
  { id: 'excavation', name: 'Excavation', stage: 0, description: 'Excavate once OR pay 2 food to excavate twice AND/OR Gain 1 stone', iconicDescription: '[pickaxe] | 2[food] [arrow-right] [pickaxe] [pickaxe] \n  +1[stone]' },
  { id: 'undergrowth', name: 'Undergrowth', stage: 0, description: 'Activate 1 orange room AND/OR Gain up to 2 wood', iconicDescription: '[1] [space] +2[wood]' },
];

export const STAGE_2_ACTIONS: ActionTile[] = [
  { id: 'furnishing', name: 'Furnishing', stage: 2, description: 'Gain 1 food AND/OR Pay food equal to the number of turns this round to furnish a cavern', iconicDescription: '+1[food] \n ?[food] [arrow-right] [furnish]' },
  { id: 'masonry', name: 'Masonry', stage: 2, description: 'Activate 1 orange room AND/OR Gain either 1 wood or 1 stone AND/OR Build a wall', iconicDescription: '[1] \n +1[wood] | +1[stone] \n Build a wall' },
  { id: 'undermining', name: 'Undermining', stage: 2, description: 'Activate up to 2 different orange rooms OR Excavate once, even through walls', iconicDescription: '[2] | [pickaxe] {wall}' },
];

export const STAGE_3_ACTIONS: ActionTile[] = [
  { id: 'expansion', name: 'Expansion', stage: 3, description: 'Excavate once AND/OR Pay either 5 food or 2 gold to furnish a cavern', iconicDescription: '[pickaxe] \n 5[food] | 2[gold] [arrow-right] [furnish]' },
  { id: 'breach', name: 'Breach', stage: 3, description: 'Remove one wall from anywhere to gain up to 2 stone, 3 food, and 1 gold', iconicDescription: 'Remove a wall [arrow-right] \n +2[stone] +3[food] +1[gold]' },
  { id: 'drift_mining', name: 'Drift Mining', stage: 3, description: 'Activate 1 orange room AND/OR Excavate once', iconicDescription: '[1] | [pickaxe]' },
  { id: 'expedition', name: 'Expedition', stage: 3, description: 'Pay either 5 wood or 5 stone to gain up to 4 gold OR Activate up to 3 different orange rooms', iconicDescription: '5[wood] | 5[stone] [arrow-right] +4[gold] | [3]' },
];

export const STAGE_4_ACTIONS: ActionTile[] = [
  { id: 'renovation', name: 'Renovation', stage: 4, description: 'Build a wall AND/OR Furnish a cavern at no additional cost. (You must still pay the cost printed on the chosen room tile.)', iconicDescription: 'Build a wall \n [furnish]' },
];

function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function setupSoloActionBoard() {
  const futureActions = [
    ...shuffle(STAGE_2_ACTIONS),
    ...shuffle(STAGE_3_ACTIONS.filter(a => a.id !== 'breach')),
    ...STAGE_4_ACTIONS
  ];
  return {
    availableActions: [...STARTING_ACTIONS],
    futureActions
  };
}
