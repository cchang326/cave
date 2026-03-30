import React from 'react';
import { RoomTile } from '../types/game';
import { WallRequirementIcon } from './WallRequirementIcon';

interface Props {
  tiles: RoomTile[];
  isSelectable?: boolean;
  selectedRoomId?: string;
  onRoomClick?: (id: string) => void;
}

const renderCost = (cost: RoomTile['cost']) => {
  const parts = [];
  if (cost.wood) parts.push(`${cost.wood}W`);
  if (cost.stone) parts.push(`${cost.stone}S`);
  if (cost.emmer) parts.push(`${cost.emmer}E`);
  if (cost.flax) parts.push(`${cost.flax}F`);
  if (cost.food) parts.push(`${cost.food}Fd`);
  if (cost.gold) parts.push(`${cost.gold}G`);
  return parts.join(' ');
};

export const CentralDisplay: React.FC<Props> = ({ tiles, isSelectable = false, selectedRoomId, onRoomClick }) => {
  return (
    <div className="bg-stone-800 p-4 rounded-xl shadow-lg border border-stone-700 min-h-full">
      <h2 className="text-stone-300 text-[10px] font-bold uppercase tracking-widest mb-4 text-center">Central Display</h2>
      <div className="grid grid-cols-4 gap-3 justify-items-center">
        {tiles.map(tile => {
          const isSelected = selectedRoomId === tile.id;
          return (
            <div 
              key={tile.id} 
              onClick={() => isSelectable && onRoomClick && onRoomClick(tile.id)}
              title={tile.effectDescription}
              className={`w-32 h-32 rounded-lg p-1.5 border-2 flex flex-col items-center justify-start text-center relative shadow-md transition-all
                ${tile.color === 'orange' ? 'bg-orange-100 border-orange-400' : 'bg-blue-100 border-blue-400'}
                ${isSelectable ? 'cursor-pointer hover:scale-105 ring-4 ring-orange-400/50 animate-pulse' : ''}
                ${isSelected ? 'ring-8 ring-orange-500/50 border-orange-600 scale-110 z-10' : ''}
              `}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-lg z-20 animate-bounce">
                  Selected
                </div>
              )}
              <span className="text-xs font-bold text-stone-800 leading-tight mt-0.5">{tile.name}</span>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                {Object.keys(tile.cost).length > 0 && (
                  <span className="text-[10px] font-bold text-stone-600">Cost: {renderCost(tile.cost)}</span>
                )}
                <WallRequirementIcon req={tile.wallRequirement} />
              </div>
              <div className="text-[10px] text-stone-700 leading-tight mt-1 px-1 line-clamp-3">{tile.effectDescription}</div>
              <span className="absolute bottom-1 right-1 bg-stone-800 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">{tile.vp} VP</span>
            </div>
          );
        })}
        {tiles.length === 0 && (
          <div className="text-stone-500 text-sm italic w-full text-center py-12 border-2 border-dashed border-stone-700 rounded-lg">
            No rooms excavated yet.
          </div>
        )}
      </div>
    </div>
  );
};
