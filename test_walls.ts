import { getSpaceWalls, isValidRoomPlacement } from './src/utils/walls.ts';

const walls = getSpaceWalls(0, 0, []);
console.log("0,0 walls:", walls);

const req = { min: 1, max: 2, configuration: 'adjacent' as const };
console.log("0,0 valid:", isValidRoomPlacement(0, 0, [], req));

const walls40 = getSpaceWalls(4, 0, []);
console.log("4,0 walls:", walls40);
console.log("4,0 valid:", isValidRoomPlacement(4, 0, [], req));
