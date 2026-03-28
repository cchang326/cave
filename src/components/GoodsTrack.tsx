import React from 'react';
import { GoodsState } from '../types/game';
import { Pickaxe, TreePine, Wheat, Leaf, Drumstick, Coins } from 'lucide-react';

interface Props {
  goods: GoodsState;
}

export const GoodsTrack: React.FC<Props> = ({ goods }) => {
  const goodIcons = {
    wood: <TreePine className="w-6 h-6 text-amber-700" />,
    stone: <Pickaxe className="w-6 h-6 text-gray-400" />,
    emmer: <Wheat className="w-6 h-6 text-yellow-500" />,
    flax: <Leaf className="w-6 h-6 text-green-500" />,
    food: <Drumstick className="w-6 h-6 text-orange-500" />,
    gold: <Coins className="w-6 h-6 text-yellow-400" />,
  };

  return (
    <div className="bg-stone-800 p-4 rounded-xl shadow-lg border border-stone-700 h-full">
      <h2 className="text-stone-300 text-sm font-bold uppercase tracking-wider mb-4 text-center">Goods</h2>
      <div className="flex flex-row md:flex-col gap-3 justify-between overflow-x-auto">
        {(Object.keys(goods) as Array<keyof GoodsState>).map((good) => (
          <div key={good} className="flex flex-col items-center bg-stone-900 p-3 rounded-lg min-w-[72px] border border-stone-700">
            {goodIcons[good]}
            <span className="text-stone-400 text-[10px] mt-1 uppercase tracking-wider">{good}</span>
            <span className="text-white font-mono text-xl font-bold">{goods[good]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
