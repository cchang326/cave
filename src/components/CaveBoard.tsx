import React from 'react';
import { CaveSpace, RoomTile } from '../types/game';
import { Pickaxe } from 'lucide-react';
import { isValidRoomPlacement } from '../utils/walls';

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
  onSpaceClick: (id: string) => void;
  onWallClick?: (wallId: string) => void;
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
  onSpaceClick,
  onWallClick
}) => {
  // Group into a 5x3 grid for display
  const grid = Array.from({ length: 5 }, (_, row) => 
    Array.from({ length: 3 }, (_, col) => {
      if (col === 2 && row !== 4) return null; // The empty cutout area
      return cave.find(c => c.row === row && c.col === col) || null;
    })
  );

  return (
    <div className="bg-stone-700 p-8 rounded-xl shadow-2xl border-4 border-stone-800 inline-block">
      <h2 className="text-stone-300 text-sm font-bold uppercase tracking-wider mb-6 text-center">Your Cave</h2>
      <div className="grid grid-cols-3 gap-4">
        {grid.flat().map((space, idx) => {
          if (!space) return <div key={idx} className="w-36 h-36 opacity-20 bg-stone-900 rounded-lg border-2 border-stone-800" title="Solid Rock" />; // Solid rock placeholder
          
          const isExcavatable = isExcavating && space.state === 'FACE_DOWN' && accessibleSpaces.includes(space.id);
          const isFurnishable = isFurnishing && 
            (space.state === 'EMPTY' || space.state === 'CROSSED_PICKAXES') &&
            (!selectedRoomTile || isValidRoomPlacement(space.row, space.col, walls, selectedRoomTile.wallRequirement));
          const isActionable = isRoomAction && space.state === 'FURNISHED' && space.tile?.trigger === 'action';
          const isClickable = isExcavatable || isFurnishable || isActionable;

          const rightWallId = `${space.row},${space.col}-${space.row},${space.col + 1}`;
          const bottomWallId = `${space.row},${space.col}-${space.row + 1},${space.col}`;
          
          const hasRightNeighbor = space.col < 2 && grid[space.row][space.col + 1] !== null;
          const hasBottomNeighbor = space.row < 4 && grid[space.row + 1][space.col] !== null;

          const hasRightWall = walls.includes(rightWallId);
          const hasBottomWall = walls.includes(bottomWallId);

          const isTopPerimeter = space.row === 0;
          const isBottomPerimeter = (space.row === 4 && space.col !== 2) || (space.row === 3 && space.col === 2);
          const isLeftPerimeter = space.col === 0 && space.row !== 3;
          const isRightPerimeter = (space.col === 2 && space.row !== 4) || (space.col === 1 && space.row === 4);

          return (
            <div key={space.id} className="relative w-36 h-36">
              {/* Perimeter Walls */}
              {isTopPerimeter && <div className="absolute -top-3 left-0 right-0 h-2 bg-stone-900 rounded-full shadow-md z-10" />}
              {isBottomPerimeter && <div className="absolute -bottom-3 left-0 right-0 h-2 bg-stone-900 rounded-full shadow-md z-10" />}
              {isLeftPerimeter && <div className="absolute -left-3 top-0 bottom-0 w-2 bg-stone-900 rounded-full shadow-md z-10" />}
              {isRightPerimeter && <div className="absolute -right-3 top-0 bottom-0 w-2 bg-stone-900 rounded-full shadow-md z-10" />}

              <div 
                onClick={() => isClickable && onSpaceClick(space.id)}
                className={`w-full h-full rounded-lg flex flex-col items-center justify-center text-center p-2 border-2 transition-all
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
                `}
              >
                {space.state === 'FACE_DOWN' && <span className="text-stone-400 text-xs font-bold uppercase tracking-widest">Unexcavated</span>}
                
                {space.state === 'CROSSED_PICKAXES' && (
                  <div className="flex text-stone-600 opacity-50">
                    <Pickaxe className="w-10 h-10 -mr-4 transform rotate-45" />
                    <Pickaxe className="w-10 h-10 transform -rotate-45" style={{ transform: 'scaleX(-1) rotate(45deg)' }} />
                  </div>
                )}
                
                {space.state === 'ENTRANCE' && <span className="text-orange-800 text-sm font-bold leading-tight">Cave<br/>Entrance</span>}
                
                {space.state === 'FURNISHED' && space.tile && (
                  <>
                    <span className="text-sm font-bold text-stone-800 leading-tight mt-1">{space.tile.name}</span>
                    <span className="text-[10px] text-stone-700 leading-tight mt-2 px-1">{space.tile.effectDescription}</span>
                    <span className="absolute bottom-1 right-1 bg-stone-800 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">{space.tile.vp} VP</span>
                  </>
                )}
              </div>

              {/* Right Wall */}
              {hasRightNeighbor && (
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
              {hasBottomNeighbor && (
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
