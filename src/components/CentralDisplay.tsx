import React from 'react';
import { RoomTile } from '../types/game';
import { WallRequirementIcon } from './WallRequirementIcon';

interface Props {
  tiles: RoomTile[];
  isSelectable?: boolean;
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

export const CentralDisplay: React.FC<Props> = ({ tiles, isSelectable = false, onRoomClick }) => {
  return (
    <div className="bg-stone-800 p-6 rounded-xl shadow-lg border border-stone-700 h-full">
      <h2 className="text-stone-300 text-sm font-bold uppercase tracking-wider mb-6 text-center">Central Display</h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {tiles.map(tile => (
          <div 
            key={tile.id} 
            onClick={() => isSelectable && onRoomClick && onRoomClick(tile.id)}
            className={`w-36 h-36 rounded-lg p-2 border-2 flex flex-col items-center justify-start text-center relative shadow-md transition-all
              ${tile.color === 'orange' ? 'bg-orange-100 border-orange-400' : 'bg-blue-100 border-blue-400'}
              ${isSelectable ? 'cursor-pointer hover:scale-105 ring-4 ring-orange-400/50 animate-pulse' : ''}
            `}
          >
            <WallRequirementIcon req={tile.wallRequirement} className="absolute top-1.5 left-1.5" />
            <span className="text-sm font-bold text-stone-800 leading-tight mt-1">{tile.name}</span>
            {Object.keys(tile.cost).length > 0 && (
              <span className="text-[10px] font-bold text-stone-600 mt-1">Cost: {renderCost(tile.cost)}</span>
            )}
            <span className="text-[10px] text-stone-700 leading-tight mt-1 px-1">{tile.effectDescription}</span>
            <span className="absolute bottom-1 right-1 bg-stone-800 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">{tile.vp} VP</span>
          </div>
        ))}
        {tiles.length === 0 && (
          <div className="text-stone-500 text-sm italic w-full text-center py-12 border-2 border-dashed border-stone-700 rounded-lg">
            No rooms excavated yet.
          </div>
        )}
      </div>
    </div>
  );
};
