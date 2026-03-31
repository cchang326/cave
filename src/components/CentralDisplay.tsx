import React, { ReactNode } from 'react';
import { RoomTile } from '../types/game';
import { WallRequirementIcon } from './WallRequirementIcon';
import { IconicDescription } from './IconicDescription';
import { TreePine, Wheat, Leaf, Drumstick, Coins } from 'lucide-react';
import { StoneIcon } from './StoneIcon';

interface Props {
  tiles: RoomTile[];
  isSelectable?: boolean;
  selectedRoomId?: string;
  showIconicDescription?: boolean;
  onRoomClick?: (id: string) => void;
}

const renderCost = (cost: RoomTile['cost']): ReactNode => {
  const parts: ReactNode[] = [];
  const iconClass = "w-3 h-3 inline-block ml-0.5";
  
  if (cost.wood) {
    parts.push(
      <span key="wood" className="flex items-center">
        {cost.wood}<TreePine className={`${iconClass} text-amber-900`} />
      </span>
    );
  }
  if (cost.stone) {
    parts.push(
      <span key="stone" className="flex items-center">
        {cost.stone}<StoneIcon className={`${iconClass} text-stone-600`} />
      </span>
    );
  }
  if (cost.emmer) {
    parts.push(
      <span key="emmer" className="flex items-center">
        {cost.emmer}<Wheat className={`${iconClass} text-yellow-800`} />
      </span>
    );
  }
  if (cost.flax) {
    parts.push(
      <span key="flax" className="flex items-center">
        {cost.flax}<Leaf className={`${iconClass} text-green-800`} />
      </span>
    );
  }
  if (cost.food) {
    parts.push(
      <span key="food" className="flex items-center">
        {cost.food}<Drumstick className={`${iconClass} text-orange-800`} />
      </span>
    );
  }
  if (cost.gold) {
    parts.push(
      <span key="gold" className="flex items-center">
        {cost.gold}<Coins className={`${iconClass} text-amber-600`} />
      </span>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      {parts}
    </div>
  );
};

export const CentralDisplay: React.FC<Props> = ({ 
  tiles, 
  isSelectable = false, 
  selectedRoomId, 
  showIconicDescription = true,
  onRoomClick 
}) => {
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
              className={`w-32 h-32 rounded-lg p-0.5 border-2 flex flex-col items-center justify-start text-center relative shadow-md transition-all
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
              <div className={`w-full py-1.5 px-1 rounded-t-md flex items-center justify-center -mt-0.5 -mx-0.5 ${tile.color === 'orange' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}>
                <span className="text-[11px] font-bold leading-tight truncate">{tile.name}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 w-full bg-stone-200/60 py-0.5 px-1 border-b border-stone-300/30">
                {Object.keys(tile.cost).length > 0 && (
                  <div className="text-[10px] font-bold text-stone-800 flex items-center gap-1">
                    <span className="text-[8px] uppercase tracking-tighter opacity-70">Cost:</span>
                    {renderCost(tile.cost)}
                  </div>
                )}
                <WallRequirementIcon req={tile.wallRequirement} className="w-4 h-4" />
              </div>
              <div className="mt-1 w-full flex justify-center">
                {showIconicDescription && tile.iconicDescription ? (
                  <IconicDescription description={tile.iconicDescription} className="justify-center" />
                ) : (
                  <div className="text-[10px] text-stone-900 leading-tight line-clamp-3">{tile.effectDescription}</div>
                )}
              </div>
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
