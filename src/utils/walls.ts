import { WallRequirement } from '../types/game';

export function getSpaceWalls(row: number, col: number, internalWalls: string[]) {
  const top = row === 0 || (row === 4 && col === 2) || internalWalls.includes(`${row - 1},${col}-${row},${col}`);
  const bottom = row === 4 || internalWalls.includes(`${row},${col}-${row + 1},${col}`);
  const left = (col === 0 && row !== 3) || internalWalls.includes(`${row},${col - 1}-${row},${col}`);
  const right = (col === 1 && row !== 4) || (col === 2 && row === 4) || internalWalls.includes(`${row},${col}-${row},${col + 1}`);

  return { top, right, bottom, left };
}

export function isValidRoomPlacement(row: number, col: number, internalWalls: string[], req?: WallRequirement): boolean {
  if (!req) return true;

  const walls = getSpaceWalls(row, col, internalWalls);
  const count = (walls.top ? 1 : 0) + (walls.right ? 1 : 0) + (walls.bottom ? 1 : 0) + (walls.left ? 1 : 0);

  // The room requires at least `req.min` walls.
  if (count < req.min) return false;

  // If the tile requires exactly 2 walls and the space has exactly 2 walls,
  // we must ensure the space's walls match the required configuration.
  // (If the space has 3 or 4 walls, it automatically satisfies any 2-wall configuration).
  if (req.min === 2 && count === 2) {
    if (req.configuration === 'adjacent') {
      const isAdjacent = (walls.top && walls.right) || (walls.right && walls.bottom) || (walls.bottom && walls.left) || (walls.left && walls.top);
      if (!isAdjacent) return false;
    }

    if (req.configuration === 'opposing') {
      const isOpposing = (walls.top && walls.bottom) || (walls.left && walls.right);
      if (!isOpposing) return false;
    }
  }

  // We ignore req.max because the game rules state:
  // "It does not matter if there are more walls in your cave than required by the room tile."
  return true;
}
