import { ChecklistItem, ActionBoardState } from '../types/game';

export function generateChecklistForAction(actionId: string, board: ActionBoardState): ChecklistItem[] {
  switch (actionId) {
    case 'cultivation':
      return [
        { id: 'c1', text: 'Activate 1 orange room', actionType: 'ROOM_ACTION', optional: true, status: 'TODO', data: { count: 1 } },
        { id: 'c2', text: 'Gain up to 2 Emmer', actionType: 'GAIN', optional: true, status: 'TODO', data: { goods: { emmer: 2 } } },
        { id: 'c3', text: 'Gain 1 Flax', actionType: 'GAIN', optional: true, status: 'TODO', data: { goods: { flax: 1 } } }
      ];
    case 'undergrowth':
      return [
        { id: 'u1', text: 'Activate 1 orange room', actionType: 'ROOM_ACTION', optional: true, status: 'TODO', data: { count: 1 } },
        { id: 'u2', text: 'Gain up to 2 Wood', actionType: 'GAIN', optional: true, status: 'TODO', data: { goods: { wood: 2 } } }
      ];
    case 'excavation':
      return [
        { id: 'e1', text: 'Excavate 1 Cavern', actionType: 'EXCAVATE', optional: true, exclusiveGroup: 'excavate', status: 'TODO', data: { count: 1 } },
        { id: 'e2', text: 'Pay 2 Food to Excavate 2 Caverns', actionType: 'EXCAVATE', optional: true, exclusiveGroup: 'excavate', status: 'TODO', data: { count: 2, payBefore: { food: 2 } } },
        { id: 'e3', text: 'Gain 1 Stone', actionType: 'GAIN', optional: true, status: 'TODO', data: { goods: { stone: 1 } } }
      ];
    case 'housework':
      return [
        { id: 'h1', text: `Pay ${board.maxTurns} Food to Furnish`, actionType: 'FURNISH', optional: true, exclusiveGroup: 'housework_furnish', status: 'TODO', data: { count: 1, payBefore: { food: board.maxTurns } } },
        { id: 'h2', text: 'Pay 5 Food to Furnish', actionType: 'FURNISH', optional: true, exclusiveGroup: 'housework_furnish', status: 'TODO', data: { count: 1, payBefore: { food: 5 } } },
        { id: 'h3', text: 'Pay 1 Gold to Furnish', actionType: 'FURNISH', optional: true, exclusiveGroup: 'housework_furnish', status: 'TODO', data: { count: 1, payBefore: { gold: 1 } } }
      ];
    case 'furnishing':
      return [
        { id: 'f1', text: 'Gain 1 Food', actionType: 'GAIN', optional: true, status: 'TODO', data: { goods: { food: 1 } } },
        { id: 'f2', text: `Pay ${board.maxTurns} Food to Furnish`, actionType: 'FURNISH', optional: true, status: 'TODO', data: { count: 1, payBefore: { food: board.maxTurns } } }
      ];
    case 'masonry':
      return [
        { id: 'm1', text: 'Activate 1 orange room', actionType: 'ROOM_ACTION', optional: true, status: 'TODO', data: { count: 1 } },
        { id: 'm2', text: 'Gain 1 Wood', actionType: 'GAIN', optional: true, exclusiveGroup: 'masonry_gain', status: 'TODO', data: { goods: { wood: 1 } } },
        { id: 'm3', text: 'Gain 1 Stone', actionType: 'GAIN', optional: true, exclusiveGroup: 'masonry_gain', status: 'TODO', data: { goods: { stone: 1 } } },
        { id: 'm4', text: 'Build a wall', actionType: 'BUILD_WALL', optional: true, status: 'TODO', data: { count: 1 } }
      ];
    case 'undermining':
      return [
        { id: 'um1', text: 'Activate up to 2 different orange rooms', actionType: 'ROOM_ACTION', optional: true, exclusiveGroup: 'undermining', status: 'TODO', data: { count: 2 } },
        { id: 'um2', text: 'Excavate once, even through walls', actionType: 'EXCAVATE', optional: true, exclusiveGroup: 'undermining', status: 'TODO', data: { count: 1, ignoreWalls: true } }
      ];
    case 'drift_mining':
      return [
        { id: 'dm1', text: 'Activate 1 orange room', actionType: 'ROOM_ACTION', optional: true, status: 'TODO', data: { count: 1 } },
        { id: 'dm2', text: 'Excavate once', actionType: 'EXCAVATE', optional: true, status: 'TODO', data: { count: 1 } }
      ];
    case 'expansion':
      return [
        { id: 'ex1', text: 'Excavate once', actionType: 'EXCAVATE', optional: true, status: 'TODO', data: { count: 1 } },
        { id: 'ex2', text: 'Pay 5 Food to Furnish', actionType: 'FURNISH', optional: true, exclusiveGroup: 'expansion_furnish', status: 'TODO', data: { count: 1, payBefore: { food: 5 } } },
        { id: 'ex3', text: 'Pay 2 Gold to Furnish', actionType: 'FURNISH', optional: true, exclusiveGroup: 'expansion_furnish', status: 'TODO', data: { count: 1, payBefore: { gold: 2 } } }
      ];
    case 'breach':
      return [
        { id: 'b1', text: 'Remove one wall to gain 2 stone, 3 food, 1 gold', actionType: 'REMOVE_WALL', optional: true, status: 'TODO', data: { count: 1, gainAfter: { stone: 2, food: 3, gold: 1 } } }
      ];
    case 'expedition':
      return [
        { id: 'ep1', text: 'Pay 5 Wood to gain 4 Gold', actionType: 'GAIN', optional: true, exclusiveGroup: 'expedition', status: 'TODO', data: { payBefore: { wood: 5 }, goods: { gold: 4 } } },
        { id: 'ep2', text: 'Pay 5 Stone to gain 4 Gold', actionType: 'GAIN', optional: true, exclusiveGroup: 'expedition', status: 'TODO', data: { payBefore: { stone: 5 }, goods: { gold: 4 } } },
        { id: 'ep3', text: 'Activate up to 3 different orange rooms', actionType: 'ROOM_ACTION', optional: true, exclusiveGroup: 'expedition', status: 'TODO', data: { count: 3 } }
      ];
    case 'renovation':
      return [
        { id: 'r1', text: 'Build a wall', actionType: 'BUILD_WALL', optional: true, status: 'TODO', data: { count: 1 } },
        { id: 'r2', text: 'Furnish a cavern at no additional cost', actionType: 'FURNISH', optional: true, status: 'TODO', data: { count: 1, freeFurnish: true } }
      ];
    default:
      return [];
  }
}

export function getRoomActionChecklistItems(roomId: string): ChecklistItem[] {
  const ts = Date.now();
  switch (roomId) {
    case 'shelf':
      return [
        {
          id: `shelf_${ts}`,
          text: 'Set either wood or stone or emmer or flax to 2',
          status: 'TODO',
          actionType: 'CHOICE',
          optional: true,
          data: {
            options: [
              { label: 'Set Wood to 2', cost: {}, items: [{ id: `sh_w_${ts}`, text: 'Set Wood to 2', actionType: 'GAIN', status: 'TODO', data: { replenishUpTo: { wood: 2 } } }] },
              { label: 'Set Stone to 2', cost: {}, items: [{ id: `sh_s_${ts}`, text: 'Set Stone to 2', actionType: 'GAIN', status: 'TODO', data: { replenishUpTo: { stone: 2 } } }] },
              { label: 'Set Emmer to 2', cost: {}, items: [{ id: `sh_e_${ts}`, text: 'Set Emmer to 2', actionType: 'GAIN', status: 'TODO', data: { replenishUpTo: { emmer: 2 } } }] },
              { label: 'Set Flax to 2', cost: {}, items: [{ id: `sh_f_${ts}`, text: 'Set Flax to 2', actionType: 'GAIN', status: 'TODO', data: { replenishUpTo: { flax: 2 } } }] }
            ]
          }
        }
      ];
    case 'spinning_wheel':
      return [
        {
          id: `sw_${ts}`,
          text: 'Spinning Wheel',
          status: 'TODO',
          actionType: 'CHOICE',
          optional: true,
          data: {
            options: [
              { label: 'Pay 1 flax to gain 1 gold', cost: { flax: 1 }, items: [{ id: `sw_1_${ts}`, text: 'Pay 1 flax to gain 1 gold', actionType: 'GAIN', status: 'TODO', data: { payBefore: { flax: 1 }, goods: { gold: 1 } } }] },
              { label: 'Pay 3 flax to gain 2 gold', cost: { flax: 3 }, items: [{ id: `sw_2_${ts}`, text: 'Pay 3 flax to gain 2 gold', actionType: 'GAIN', status: 'TODO', data: { payBefore: { flax: 3 }, goods: { gold: 2 } } }] }
            ]
          }
        }
      ];
    case 'tunnel':
      return [
        { id: `tn_1_${ts}`, text: 'Gain up to 2 food', actionType: 'GAIN', optional: true, status: 'TODO', data: { replenishUpTo: { food: 2 } } },
        { id: `tn_2_${ts}`, text: 'If you have less than 3 stone, gain 1 stone', actionType: 'GAIN', optional: true, status: 'TODO', data: { goods: { stone: 1 }, condition: { maxStone: 2 } } }
      ];
    case 'grindstone':
      return [
        {
          id: `gs_${ts}`,
          text: 'Grindstone',
          status: 'TODO',
          actionType: 'CHOICE',
          optional: true,
          data: {
            options: [
              { label: 'Pay 1 emmer to gain up to 3 food', cost: { emmer: 1 }, items: [{ id: `gs_1_${ts}`, text: 'Pay 1 emmer to gain up to 3 food', actionType: 'GAIN', status: 'TODO', data: { payBefore: { emmer: 1 }, replenishUpTo: { food: 3 } } }] },
              { label: 'Pay 4 emmer to gain up to 7 food', cost: { emmer: 4 }, items: [{ id: `gs_2_${ts}`, text: 'Pay 4 emmer to gain up to 7 food', actionType: 'GAIN', status: 'TODO', data: { payBefore: { emmer: 4 }, replenishUpTo: { food: 7 } } }] }
            ]
          }
        }
      ];
    case 'food_corner':
      return [
        { id: `fc_${ts}`, text: 'Set food to 3', actionType: 'GAIN', optional: true, status: 'TODO', data: { replenishUpTo: { food: 3 } } }
      ];
    case 'parlor':
      return [
        { id: `pr_${ts}`, text: 'Gain 1 good of each type of which you have 0 goods', actionType: 'GAIN', optional: true, status: 'TODO', data: { parlorEffect: true } }
      ];
    case 'warehouse':
      return [
        { id: `wh_${ts}`, text: 'Pay 2 food to gain up to 1 wood, 1 stone, 1 emmer, and 1 flax', actionType: 'GAIN', optional: true, status: 'TODO', data: { payBefore: { food: 2 }, replenishUpTo: { wood: 1, stone: 1, emmer: 1, flax: 1 } } }
      ];
    case 'stall':
      return [
        {
          id: `st_${ts}`,
          text: 'Stall',
          status: 'TODO',
          actionType: 'CHOICE',
          optional: true,
          data: {
            options: [
              { label: 'Pay 5 emmer to gain up to 4 gold', cost: { emmer: 5 }, items: [{ id: `st_1_${ts}`, text: 'Pay 5 emmer to gain up to 4 gold', actionType: 'GAIN', status: 'TODO', data: { payBefore: { emmer: 5 }, replenishUpTo: { gold: 4 } } }] },
              { label: 'Pay 5 flax to gain up to 4 gold', cost: { flax: 5 }, items: [{ id: `st_2_${ts}`, text: 'Pay 5 flax to gain up to 4 gold', actionType: 'GAIN', status: 'TODO', data: { payBefore: { flax: 5 }, replenishUpTo: { gold: 4 } } }] }
            ]
          }
        }
      ];
    case 'sacrificial_altar':
      return [
        { id: `sa_${ts}`, text: 'Pay 1 wood, 1 emmer, 1 flax, and 1 food to gain up to 3 gold', actionType: 'GAIN', optional: true, status: 'TODO', data: { payBefore: { wood: 1, emmer: 1, flax: 1, food: 1 }, replenishUpTo: { gold: 3 } } }
      ];
    case 'storeroom':
      return [
        { id: `sr_${ts}`, text: 'Gain up to 1 emmer, 1 flax, and 1 food', actionType: 'GAIN', optional: true, status: 'TODO', data: { replenishUpTo: { emmer: 1, flax: 1, food: 1 } } }
      ];
    case 'weaving_room':
      return [
        { id: `wr_${ts}`, text: 'Pay 2 flax to gain up to 2 food and 2 gold', actionType: 'GAIN', optional: true, status: 'TODO', data: { payBefore: { flax: 2 }, replenishUpTo: { food: 2, gold: 2 } } }
      ];
    case 'furniture_workshop':
      return [
        { id: `fw_${ts}`, text: 'Pay 2 wood and 1 flax to gain up to 3 gold', actionType: 'GAIN', optional: true, status: 'TODO', data: { payBefore: { wood: 2, flax: 1 }, replenishUpTo: { gold: 3 } } }
      ];
    case 'gold_vein':
      return [
        { id: `gv_${ts}`, text: 'Gain up to 1 stone and 1 gold', actionType: 'GAIN', optional: true, status: 'TODO', data: { replenishUpTo: { stone: 1, gold: 1 } } }
      ];
    case 'junction_room':
      return [
        { id: `jr_${ts}`, text: 'Pay 3 different goods to gain up to 2 gold', actionType: 'PAY_DYNAMIC', optional: true, status: 'TODO', data: { amount: 3, gainAfter: { gold: 2 }, replenishUpToGainAfter: true } }
      ];
    case 'digging_cave':
      return [
        { id: `dc_${ts}`, text: 'Pay 1 gold to excavate once', actionType: 'EXCAVATE', optional: true, status: 'TODO', data: { count: 1, payBefore: { gold: 1 } } }
      ];
    case 'bakehouse':
      return [
        {
          id: `bh_${ts}`,
          text: 'Bakehouse',
          status: 'TODO',
          actionType: 'CHOICE',
          optional: true,
          data: {
            options: [
              { label: 'Pay 2 emmer to gain up to 4 food and 1 gold', cost: { emmer: 2 }, items: [{ id: `bh_1_${ts}`, text: 'Pay 2 emmer to gain up to 4 food and 1 gold', actionType: 'GAIN', status: 'TODO', data: { payBefore: { emmer: 2 }, replenishUpTo: { food: 4, gold: 1 } } }] },
              { label: 'Pay 3 emmer to gain up to 4 food and 2 gold', cost: { emmer: 3 }, items: [{ id: `bh_2_${ts}`, text: 'Pay 3 emmer to gain up to 4 food and 2 gold', actionType: 'GAIN', status: 'TODO', data: { payBefore: { emmer: 3 }, replenishUpTo: { food: 4, gold: 2 } } }] }
            ]
          }
        }
      ];
    case 'state_room':
      return [
        { id: `str_${ts}`, text: 'Gain up to 1 flax and 1 gold', actionType: 'GAIN', optional: true, status: 'TODO', data: { replenishUpTo: { flax: 1, gold: 1 } } }
      ];
    case 'secret_chamber':
      return [
        {
          id: `sc_${ts}`,
          text: 'Secret Chamber',
          status: 'TODO',
          actionType: 'CHOICE',
          optional: true,
          data: {
            options: [
              { label: 'Gain up to 3 flax', cost: {}, items: [{ id: `sc_1_${ts}`, text: 'Gain up to 3 flax', actionType: 'GAIN', status: 'TODO', data: { replenishUpTo: { flax: 3 } } }] },
              { label: 'Gain up to 1 gold', cost: {}, items: [{ id: `sc_2_${ts}`, text: 'Gain up to 1 gold', actionType: 'GAIN', status: 'TODO', data: { replenishUpTo: { gold: 1 } } }] }
            ]
          }
        }
      ];
    case 'treasury':
      return [
        { id: `tr_${ts}`, text: 'Pay 1 wood, 1 stone, 1 emmer, 1 flax, 1 food, and 1 gold to gain up to 5 gold', actionType: 'GAIN', optional: true, status: 'TODO', data: { payBefore: { wood: 1, stone: 1, emmer: 1, flax: 1, food: 1, gold: 1 }, replenishUpTo: { gold: 5 } } }
      ];
    // Original Era I rooms
    case 'seamstery':
      return [
        { id: `sm_${ts}`, text: 'Pay 1 flax to gain 2 gold', actionType: 'GAIN', optional: true, status: 'TODO', data: { payBefore: { flax: 1 }, goods: { gold: 2 } } }
      ];
    case 'stone_storage':
      return [
        { id: `ss_${ts}`, text: 'Gain 2 stone', actionType: 'GAIN', optional: true, status: 'TODO', data: { goods: { stone: 2 } } }
      ];
    case 'cereal_storage':
      return [
        { id: `cs_${ts}`, text: 'Gain 2 emmer', actionType: 'GAIN', optional: true, status: 'TODO', data: { goods: { emmer: 2 } } }
      ];
    case 'weaving_parlor':
      return [
        { id: `wp_${ts}`, text: 'Pay 1 flax to gain 2 food', actionType: 'GAIN', optional: true, status: 'TODO', data: { payBefore: { flax: 1 }, goods: { food: 2 } } }
      ];
    case 'wood_supplier':
      return [
        { id: `ws_${ts}`, text: 'Gain 2 wood', actionType: 'GAIN', optional: true, status: 'TODO', data: { goods: { wood: 2 } } }
      ];
    case 'flax_room':
      return [
        { id: `fr_${ts}`, text: 'Gain 2 flax', actionType: 'GAIN', optional: true, status: 'TODO', data: { goods: { flax: 2 } } }
      ];
    case 'trading_cave':
      return [
        { id: `tc_${ts}`, text: 'Pay 1 gold to gain 2 wood and 2 stone', actionType: 'GAIN', optional: true, status: 'TODO', data: { payBefore: { gold: 1 }, goods: { wood: 2, stone: 2 } } }
      ];
    case 'work_room':
      return [
        { id: `wkr_${ts}`, text: 'Pay 1 food to gain 1 wood and 1 stone', actionType: 'GAIN', optional: true, status: 'TODO', data: { payBefore: { food: 1 }, goods: { wood: 1, stone: 1 } } }
      ];
    default:
      return [];
  }
}
