import { RoomTile } from '../types/game';

export const MOCK_TILES: Record<string, RoomTile> = {
  caveEntrance: {
    id: 'caveEntrance',
    name: 'Cave Entrance',
    color: 'orange',
    cost: {},
    vp: 0,
    trigger: 'none',
    effectDescription: 'Gain either 1 wood or 1 stone or 1 emmer or 1 flax',
  }
};

export const MOCK_ROOM_TILES: RoomTile[] = [
  {
    id: 'shelf',
    name: 'Shelf',
    color: 'orange',
    cost: { wood: 1 },
    vp: 3,
    wallRequirement: { min: 1, max: 1, configuration: 'any' },
    trigger: 'action',
    effectDescription: 'Set either wood or stone or emmer or flax to 2.'
  },
  {
    id: 'spinning_wheel',
    name: 'Spinning Wheel',
    color: 'orange',
    cost: { wood: 1 },
    vp: 4,
    wallRequirement: { min: 1, max: 1, configuration: 'any' },
    trigger: 'action',
    effectDescription: 'Pay 1 flax to gain 1 gold OR Pay 3 flax to gain 2 gold'
  },
  {
    id: 'tunnel',
    name: 'Tunnel',
    color: 'orange',
    cost: { wood: 1 },
    vp: 3,
    wallRequirement: { min: 2, max: 2, configuration: 'opposing' },
    trigger: 'action',
    effectDescription: 'Gain up to 2 food AND/OR If you have less than 3 stone, gain 1 stone'
  },
  {
    id: 'grindstone',
    name: 'Grindstone',
    color: 'orange',
    cost: { stone: 1 },
    vp: 4,
    wallRequirement: { min: 1, max: 2, configuration: 'adjacent' },
    trigger: 'action',
    effectDescription: 'Pay 1 emmer to gain up to 3 food OR Pay 4 emmer to gain up to 7 food'
  },
  {
    id: 'food_corner',
    name: 'Food Corner',
    color: 'orange',
    cost: { stone: 1 },
    vp: 3,
    wallRequirement: { min: 2, max: 2, configuration: 'adjacent' },
    trigger: 'action',
    effectDescription: 'Set food to 3'
  },
  {
    id: 'parlor',
    name: 'Parlor',
    color: 'orange',
    cost: { stone: 1, gold: 1 },
    vp: 6,
    wallRequirement: { min: 3, max: 3, configuration: 'any' },
    trigger: 'action',
    effectDescription: 'Gain 1 good of each type of which you have 0 goods.'
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    color: 'orange',
    cost: { wood: 2 },
    vp: 2,
    wallRequirement: { min: 1, max: 3, configuration: 'adjacent' },
    trigger: 'action',
    effectDescription: 'Pay 2 food to gain up to 1 wood, 1 stone, 1 emmer, and 1 flax'
  },
  {
    id: 'stall',
    name: 'Stall',
    color: 'orange',
    cost: { wood: 1, gold: 1 },
    vp: 6,
    wallRequirement: { min: 1, max: 3, configuration: 'adjacent' },
    trigger: 'action',
    effectDescription: 'Pay either 5 emmer or 5 flax to gain up to 4 gold.'
  },
  {
    id: 'sacrificial_altar',
    name: 'Sacrificial Altar',
    color: 'orange',
    cost: { stone: 4 },
    vp: 7,
    wallRequirement: { min: 1, max: 3, configuration: 'adjacent' },
    trigger: 'action',
    effectDescription: 'Pay 1 wood, 1 emmer, 1 flax, and 1 food to gain up to 3 gold'
  },
  {
    id: 'storeroom',
    name: 'Storeroom',
    color: 'orange',
    cost: { wood: 2, gold: 1 },
    vp: 6,
    wallRequirement: { min: 2, max: 2, configuration: 'adjacent' },
    trigger: 'action',
    effectDescription: 'Gain up to 1 emmer, 1 flax, and 1 food'
  },
  {
    id: 'weaving_room',
    name: 'Weaving Room',
    color: 'orange',
    cost: { wood: 2 },
    vp: 5,
    wallRequirement: { min: 2, max: 2, configuration: 'adjacent' },
    trigger: 'action',
    effectDescription: 'Pay 2 flax to gain up to 2 food and 2 gold'
  },
  {
    id: 'furniture_workshop',
    name: 'Furniture Workshop',
    color: 'orange',
    cost: { wood: 1, stone: 2 },
    vp: 5,
    wallRequirement: { min: 2, max: 3, configuration: 'adjacent' },
    trigger: 'action',
    effectDescription: 'Pay 2 wood and 1 flax to gain up to 3 gold'
  },
  {
    id: 'gold_vein',
    name: 'Gold Vein',
    color: 'orange',
    cost: { gold: 5 },
    vp: 9,
    wallRequirement: { min: 2, max: 3, configuration: 'adjacent' },
    trigger: 'action',
    effectDescription: 'Gain up to 1 stone and 1 gold.'
  },
  {
    id: 'junction_room',
    name: 'Junction Room',
    color: 'orange',
    cost: { wood: 2 },
    vp: 6,
    wallRequirement: { min: 2, max: 2, configuration: 'opposing' },
    trigger: 'action',
    effectDescription: 'Pay 3 different goods to gain up to 2 gold.'
  },
  {
    id: 'digging_cave',
    name: 'Digging Cave',
    color: 'orange',
    cost: { wood: 3, stone: 1 },
    vp: 8,
    wallRequirement: { min: 3, max: 3, configuration: 'any' },
    trigger: 'action',
    effectDescription: 'Pay 1 gold to excavate once'
  },
  {
    id: 'bakehouse',
    name: 'Bakehouse',
    color: 'orange',
    cost: { wood: 1, stone: 2 },
    vp: 6,
    wallRequirement: { min: 3, max: 3, configuration: 'any' },
    trigger: 'action',
    effectDescription: 'Pay 2 emmer to gain up to 4 food and 1 gold OR Pay 3 emmer to gain up to 4 food and 2 gold'
  },
  {
    id: 'state_room',
    name: 'State Room',
    color: 'orange',
    cost: { gold: 7 },
    vp: 12,
    wallRequirement: { min: 3, max: 4, configuration: 'any' },
    trigger: 'action',
    effectDescription: 'Gain up to 1 flax and 1 gold.'
  },
  {
    id: 'secret_chamber',
    name: 'Secret Chamber',
    color: 'orange',
    cost: { wood: 2, stone: 1 },
    vp: 8,
    wallRequirement: { min: 4, max: 4, configuration: 'any' },
    trigger: 'action',
    effectDescription: 'Gain either (up to) 3 flax or 1 gold'
  },
  {
    id: 'treasury',
    name: 'Treasury',
    color: 'orange',
    cost: { gold: 3 },
    vp: 10,
    wallRequirement: { min: 4, max: 4, configuration: 'any' },
    trigger: 'action',
    effectDescription: 'If you have (at least) 3 gold, gain up to 1 food and 1 gold.'
  },
  {
    id: 'prospecting_site',
    name: 'Prospecting Site',
    color: 'blue',
    cost: {},
    vp: 5,
    wallRequirement: { min: 1, max: 2, configuration: 'adjacent' },
    trigger: 'passive',
    effectDescription: 'Each time you use the "Undergrowth" action tile, you can pay 1 food to gain 1 gold'
  },
  {
    id: 'retting_room',
    name: 'Retting Room',
    color: 'blue',
    cost: { stone: 1 },
    vp: 3,
    wallRequirement: { min: 1, max: 3, configuration: 'adjacent' },
    trigger: 'passive',
    effectDescription: 'Each time after you gain 1-3 flax from an effect, you get 1 food.'
  },
  {
    id: 'equipment_room',
    name: 'Equipment Room',
    color: 'blue',
    cost: { wood: 2 },
    vp: 3,
    wallRequirement: { min: 1, max: 2, configuration: 'adjacent' },
    trigger: 'passive',
    effectDescription: 'Undermining activates up to 3 rooms. Expedition activates up to 4 rooms.'
  },
  {
    id: 'wood_storeroom',
    name: 'Wood Storeroom',
    color: 'blue',
    cost: { stone: 1 },
    vp: 2,
    wallRequirement: { min: 2, max: 2, configuration: 'adjacent' },
    trigger: 'passive',
    effectDescription: 'Each time you use a [1] effect, also gain 1 wood, if possible.'
  },
  {
    id: 'dungeon',
    name: 'Dungeon',
    color: 'blue',
    cost: { stone: 3, gold: 4 },
    vp: 11,
    wallRequirement: { min: 4, max: 4, configuration: 'any' },
    trigger: 'passive',
    effectDescription: 'Each time you build a wall, also gain up to 2 gold.'
  }
];
