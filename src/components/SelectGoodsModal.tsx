import React, { useState } from 'react';
import { GoodsState } from '../types/game';
import { Check, X } from 'lucide-react';

interface Props {
  goods: GoodsState;
  amount: number;
  mustBeDifferent: boolean;
  onConfirm: (selected: Partial<GoodsState>) => void;
  onCancel: () => void;
}

export const SelectGoodsModal: React.FC<Props> = ({ goods, amount, mustBeDifferent, onConfirm, onCancel }) => {
  const [selected, setSelected] = useState<Partial<GoodsState>>({});

  const totalSelected = Object.values(selected).reduce((sum, val) => (sum as number) + ((val as number) || 0), 0) as number;
  const isValid = totalSelected === amount;

  const handleToggle = (good: keyof GoodsState) => {
    setSelected(prev => {
      const next = { ...prev };
      if (next[good]) {
        delete next[good];
      } else {
        if (totalSelected < amount && goods[good] > 0) {
          next[good] = 1;
        }
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-800 p-6 rounded-xl shadow-2xl border border-stone-600 max-w-md w-full">
        <h2 className="text-xl font-bold text-orange-400 mb-4">Select Goods to Pay</h2>
        <p className="text-stone-300 mb-6">
          Please select {amount} {mustBeDifferent ? 'different ' : ''}goods to pay.
          ({totalSelected}/{amount} selected)
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {(Object.keys(goods) as Array<keyof GoodsState>).map(good => {
            const isSelected = !!selected[good];
            const hasGood = goods[good] > 0;
            const disabled = !isSelected && (!hasGood || totalSelected >= amount);

            return (
              <button
                key={good}
                onClick={() => handleToggle(good)}
                disabled={disabled}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all
                  ${isSelected ? 'bg-orange-900/40 border-orange-500 text-orange-100' : 
                    disabled ? 'bg-stone-900/50 border-stone-800 text-stone-600 cursor-not-allowed' : 
                    'bg-stone-700 border-stone-600 hover:border-stone-400 text-stone-200'}
                `}
              >
                <span className="capitalize font-bold">{good}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-70">Owned: {goods[good]}</span>
                  {isSelected && <Check className="w-4 h-4 text-orange-400" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={!isValid}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 disabled:text-stone-500 text-white rounded-lg font-bold transition-colors"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};
