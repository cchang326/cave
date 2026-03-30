import React from 'react';
import { CaveSpace, RoomTile } from '../types/game';
import { Pickaxe, Ban, Drumstick } from 'lucide-react';
import { isValidRoomPlacement } from '../utils/walls';
import { WallRequirementIcon } from './WallRequirementIcon';

interface Props {
  cave: CaveSpace[];
  walls: string[];
  isExcavating: boolean;
  isFurnishing: boolean;
  isRoomAction?: boolean;
  isBuildingWall?: boolean;
  isRemovingWall?: boolean;
  accessibleSpaces: string[];
  selectedRoomTile?: RoomTile;
  activatedRoomsThisTurn?: string[];
  onSpaceClick: (id: string) => void;
  onWallClick?: (wallId: string) => void;
  children?: React.ReactNode;
}

export const CaveBoard: React.FC<Props> = ({ 
  cave, 
  walls,
  isExcavating, 
  isFurnishing, 
  isRoomAction = false, 
  isBuildingWall = false,
  isRemovingWall = false,
  accessibleSpaces, 
  selectedRoomTile,
  activatedRoomsThisTurn = [],
  onSpaceClick,
  onWallClick,
  children
}) => {
  // Group into a dynamic grid for display
  const maxRow = Math.max(...cave.map(s => s.row), 4);
  const maxCol = Math.max(...cave.map(s => s.col), 2);
  
  const grid = Array.from({ length: maxRow + 1 }, (_, row) => 
    Array.from({ length: maxCol + 1 }, (_, col) => {
      return cave.find(c => c.row === row && c.col === col) || null;
    })
  );

  return (
    <div className={`bg-stone-700 p-4 rounded-xl shadow-2xl border-4 border-stone-800 relative ${children ? 'w-full' : 'inline-block'}`}>
      <h2 className="text-stone-300 text-[10px] font-bold uppercase tracking-widest mb-4 text-center">Your Cave</h2>
      <div 
        className="grid gap-2 w-full"
        style={{ 
          gridTemplateColumns: `repeat(${maxCol + 1}, 8rem) 1fr`,
          gridTemplateRows: `repeat(${maxRow + 1}, 8rem)`
        }}
      >
        {children && (
          <div className="row-start-1 row-end-5 col-start-3 col-end-[-1] flex flex-col pl-2 z-0 pointer-events-none">
            <div className="pointer-events-auto w-full overflow-y-auto max-h-full pr-1">
              {children}
            </div>
          </div>
        )}
        {cave.map((space) => {
          const isActivated = activatedRoomsThisTurn.includes(space.id);
          const isExcavatable = isExcavating && space.state === 'FACE_DOWN' && accessibleSpaces.includes(space.id);
          const isFurnishable = isFurnishing && 
            (space.state === 'EMPTY' || space.state === 'CROSSED_PICKAXES') &&
            (!selectedRoomTile || isValidRoomPlacement(space, walls, selectedRoomTile.wallRequirement));
          const isActionable = isRoomAction && (space.state === 'FURNISHED' || space.state === 'ENTRANCE') && space.tile?.trigger === 'action' && !isActivated;
          const isClickable = isExcavatable || isFurnishable || isActionable;

          const rightWallId = `${space.row},${space.col}-${space.row},${space.col + 1}`;
          const bottomWallId = `${space.row},${space.col}-${space.row + 1},${space.col}`;
          
          const hasTopNeighbor = space.row > 0 && grid[space.row - 1][space.col] !== null;
          const hasBottomNeighbor = space.row < maxRow && grid[space.row + 1][space.col] !== null;
          const hasLeftNeighbor = space.col > 0 && grid[space.row][space.col - 1] !== null;
          const hasRightNeighbor = space.col < maxCol && grid[space.row][space.col + 1] !== null;

          const hasRightWall = walls.includes(rightWallId);
          const hasBottomWall = walls.includes(bottomWallId);

          const isTopPerimeter = !hasTopNeighbor && !space.openSides?.includes('top');
          const isBottomPerimeter = !hasBottomNeighbor && !space.openSides?.includes('bottom');
          const isLeftPerimeter = !hasLeftNeighbor && !(space.row === 3 && space.col === 0) && !space.openSides?.includes('left'); // Entrance exception
          const isRightPerimeter = !hasRightNeighbor && !space.openSides?.includes('right');

          return (
            <div 
              key={space.id} 
              className="relative w-32 h-32 z-10"
              style={{ gridRow: space.row + 1, gridColumn: space.col + 1 }}
            >
              {/* Perimeter Walls */}
              {isTopPerimeter && <div className="absolute -top-3 left-0 right-0 h-2 bg-stone-900 rounded-full shadow-md z-10" />}
              {isBottomPerimeter && <div className="absolute -bottom-3 left-0 right-0 h-2 bg-stone-900 rounded-full shadow-md z-10" />}
              {isLeftPerimeter && <div className="absolute -left-3 top-0 bottom-0 w-2 bg-stone-900 rounded-full shadow-md z-10" />}
              {isRightPerimeter && <div className="absolute -right-3 top-0 bottom-0 w-2 bg-stone-900 rounded-full shadow-md z-10" />}

              <div 
                onClick={() => isClickable && onSpaceClick(space.id)}
                className={`w-full h-full rounded-lg flex flex-col items-center justify-center text-center p-2 border-2 transition-all relative
                  ${space.state === 'FACE_DOWN' && !isExcavatable ? 'bg-stone-600 border-stone-500 shadow-inner' : ''}
                  ${space.state === 'FACE_DOWN' && isExcavatable ? 'bg-stone-500 border-orange-400 shadow-inner cursor-pointer hover:bg-stone-400 ring-4 ring-orange-400/50 animate-pulse' : ''}
                  ${space.state === 'ENTRANCE' ? 'bg-orange-200 border-orange-400' : ''}
                  ${space.state === 'FURNISHED' && space.tile?.color === 'orange' ? 'bg-orange-100 border-orange-400 justify-start' : ''}
                  ${space.state === 'FURNISHED' && space.tile?.color === 'blue' ? 'bg-blue-100 border-blue-400 justify-start' : ''}
                  ${space.state === 'CROSSED_PICKAXES' && !isFurnishable ? 'bg-stone-800 border-stone-900' : ''}
                  ${space.state === 'CROSSED_PICKAXES' && isFurnishable ? 'bg-stone-800/80 border-dashed border-orange-400 cursor-pointer hover:bg-stone-700 ring-4 ring-orange-400/50 animate-pulse' : ''}
                  ${space.state === 'EMPTY' && !isFurnishable ? 'bg-stone-800/50 border-dashed border-stone-600' : ''}
                  ${space.state === 'EMPTY' && isFurnishable ? 'bg-stone-800/80 border-dashed border-orange-400 cursor-pointer hover:bg-stone-700 ring-4 ring-orange-400/50 animate-pulse' : ''}
                  ${isActionable ? 'ring-4 ring-green-400/50 cursor-pointer hover:scale-105 animate-pulse' : ''}
                  ${isActivated ? 'opacity-60 grayscale-[0.5] border-stone-400' : ''}
                `}
              >
                {isActivated && (
                  <div className="absolute inset-0 bg-stone-900/20 flex items-center justify-center pointer-events-none z-20 rounded-lg">
                    <span className="bg-stone-800/90 text-stone-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-stone-600 shadow-lg transform -rotate-12">Activated</span>
                  </div>
                )}
                {space.state === 'FACE_DOWN' && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Unexcavated</span>
                  </div>
                )}

                {space.state !== 'FACE_DOWN' && ((space.row === 1 && space.col === 1) || (space.row === 3 && space.col === 1)) && (
                  <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-orange-500/10 px-1 rounded border border-orange-500/20 pointer-events-none">
                    <span className="text-orange-400/60 text-[8px] font-bold">+1</span>
                    <Drumstick className="w-2 h-2 text-orange-500/60" />
                  </div>
                )}
                
                {space.state === 'CROSSED_PICKAXES' && (
                  <div className="relative flex items-center justify-center">
                    {space.row === 2 && space.col === 0 ? (
                      <div className="relative flex items-center justify-center">
                        <Pickaxe className="w-10 h-10 text-stone-600 opacity-40" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Ban className="w-12 h-12 text-stone-500/40" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex text-stone-600 opacity-50">
                        <Pickaxe className="w-10 h-10 -mr-4 transform rotate-45" />
                        <Pickaxe className="w-10 h-10 transform -rotate-45" style={{ transform: 'scaleX(-1) rotate(45deg)' }} />
                      </div>
                    )}
                  </div>
                )}
                
                {space.state === 'ENTRANCE' && (
                  <>
                    <span className="text-orange-800 text-sm font-bold leading-tight">Cave<br/>Entrance</span>
                    {space.tile?.trigger === 'action' && (
                      <span className="text-[10px] text-stone-700 leading-tight mt-2 px-1">{space.tile.effectDescription}</span>
                    )}
                  </>
                )}
                
                {space.state === 'FURNISHED' && space.tile && (
                  <>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-sm font-bold text-stone-800 leading-tight">{space.tile.name}</span>
                      <WallRequirementIcon req={space.tile.wallRequirement} />
                    </div>
                    <span className="text-[10px] text-stone-700 leading-tight mt-2 px-1">{space.tile.effectDescription}</span>
                    <span className="absolute bottom-1 right-1 bg-stone-800 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">{space.tile.vp} VP</span>
                  </>
                )}
              </div>

              {/* Right Wall */}
              {!isRightPerimeter && (
                <div 
                  onClick={() => {
                    if (isBuildingWall && !hasRightWall) onWallClick?.(rightWallId);
                    if (isRemovingWall && hasRightWall) onWallClick?.(rightWallId);
                  }}
                  className={`absolute -right-3 top-0 bottom-0 w-2 z-10 rounded-full transition-all
                    ${hasRightWall && !isRemovingWall ? 'bg-orange-800 shadow-md' : ''}
                    ${hasRightWall && isRemovingWall ? 'bg-orange-800 shadow-md hover:bg-red-500 cursor-pointer animate-pulse' : ''}
                    ${!hasRightWall && isBuildingWall ? 'bg-orange-400/30 hover:bg-orange-400/60 cursor-pointer animate-pulse' : ''}
                    ${!hasRightWall && !isBuildingWall ? 'hidden' : ''}
                  `}
                />
              )}

              {/* Bottom Wall */}
              {!isBottomPerimeter && (
                <div 
                  onClick={() => {
                    if (isBuildingWall && !hasBottomWall) onWallClick?.(bottomWallId);
                    if (isRemovingWall && hasBottomWall) onWallClick?.(bottomWallId);
                  }}
                  className={`absolute -bottom-3 left-0 right-0 h-2 z-10 rounded-full transition-all
                    ${hasBottomWall && !isRemovingWall ? 'bg-orange-800 shadow-md' : ''}
                    ${hasBottomWall && isRemovingWall ? 'bg-orange-800 shadow-md hover:bg-red-500 cursor-pointer animate-pulse' : ''}
                    ${!hasBottomWall && isBuildingWall ? 'bg-orange-400/30 hover:bg-orange-400/60 cursor-pointer animate-pulse' : ''}
                    ${!hasBottomWall && !isBuildingWall ? 'hidden' : ''}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
