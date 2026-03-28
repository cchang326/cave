import { WallRequirement } from '../types/game';

export function getSpaceWalls(row: number, col: number, internalWalls: string[]) {
  const top = row === 0 || internalWalls.includes(`${row - 1},${col}-${row},${col}`);
  const bottom = (row === 4 && col !== 2) || (row === 3 && col === 2) || internalWalls.includes(`${row},${col}-${row + 1},${col}`);
  const left = (col === 0 && row !== 3) || internalWalls.includes(`${row},${col - 1}-${row},${col}`);
  const right = (col === 2 && row !== 4) || (col === 1 && row === 4) || internalWalls.includes(`${row},${col}-${row},${col + 1}`);

  return { top, right, bottom, left };
}

export function isValidRoomPlacement(row: number, col: number, internalWalls: string[], req?: WallRequirement): boolean {
  if (!req) return true;

  const walls = getSpaceWalls(row, col, internalWalls);
  const count = (walls.top ? 1 : 0) + (walls.right ? 1 : 0) + (walls.bottom ? 1 : 0) + (walls.left ? 1 : 0);

  if (count < req.min || count > req.max) return false;

  if (req.configuration === 'adjacent' && count === 2) {
    const isAdjacent = (walls.top && walls.right) || (walls.right && walls.bottom) || (walls.bottom && walls.left) || (walls.left && walls.top);
    if (!isAdjacent) return false;
  }

  if (req.configuration === 'opposing' && count === 2) {
    const isOpposing = (walls.top && walls.bottom) || (walls.left && walls.right);
    if (!isOpposing) return false;
  }

  return true;
}
