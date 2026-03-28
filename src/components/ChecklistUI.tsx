import React from 'react';
import { ChecklistItem, GoodsState } from '../types/game';
import { Check, X, Play, ChevronRight, Undo2 } from 'lucide-react';

interface Props {
  checklist: ChecklistItem[];
  goods: GoodsState;
  ignoreResourceValidation: boolean;
  onExecute: (id: string) => void;
  onSkip: (id: string) => void;
  onChoose: (id: string, optionIndex: number) => void;
  onFinishTurn: () => void;
  onUndoAction?: () => void;
  canUndoAction?: boolean;
}

function canAfford(goods: GoodsState, cost?: Partial<GoodsState>, ignoreValidation?: boolean): boolean {
  if (ignoreValidation) return true;
  if (!cost) return true;
  for (const key in cost) {
    const k = key as keyof GoodsState;
    if (goods[k] < (cost[k] || 0)) return false;
  }
  return true;
}

export const ChecklistUI: React.FC<Props> = ({ checklist, goods, ignoreResourceValidation, onExecute, onSkip, onChoose, onFinishTurn, onUndoAction, canUndoAction }) => {
  const allDoneOrSkipped = checklist.every(item => item.status === 'DONE' || item.status === 'SKIPPED');
  const anyDoing = checklist.some(item => item.status === 'DOING');

  return (
    <div className="bg-stone-800 p-6 rounded-xl shadow-lg border border-stone-700">
      <div className="relative flex justify-center items-center mb-4">
        <h2 className="text-stone-300 text-sm font-bold uppercase tracking-wider text-center">Action Checklist</h2>
        {canUndoAction && onUndoAction && (
          <button
            onClick={onUndoAction}
            title="Undo Action"
            className="absolute right-0 bg-red-900/50 hover:bg-red-800/80 text-red-200 p-1.5 rounded transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {checklist.map(item => (
          <div key={item.id} className={`p-3 rounded-lg border ${
            item.status === 'DONE' ? 'bg-green-900/20 border-green-800/50 text-stone-500' :
            item.status === 'SKIPPED' ? 'bg-stone-900/50 border-stone-800 text-stone-600' :
            item.status === 'DOING' ? 'bg-orange-900/30 border-orange-500/50 text-stone-200 ring-2 ring-orange-500/20' :
            'bg-stone-700 border-stone-600 text-stone-200'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {item.status === 'DONE' && <Check className="w-4 h-4 text-green-500" />}
                {item.status === 'SKIPPED' && <X className="w-4 h-4 text-stone-500" />}
                {item.status === 'DOING' && <Play className="w-4 h-4 text-orange-400 animate-pulse" />}
                {item.status === 'TODO' && <div className="w-4 h-4 rounded-full border-2 border-stone-500" />}
                <span className={`font-medium ${item.status === 'DONE' || item.status === 'SKIPPED' ? 'line-through' : ''}`}>
                  {item.text}
                </span>
              </div>
              
              {item.status === 'TODO' && item.actionType !== 'CHOICE' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => onExecute(item.id)}
                    disabled={
                      anyDoing ||
                      (item.actionType === 'PAY' && !canAfford(goods, item.data?.goods, ignoreResourceValidation)) ||
                      (item.data?.payBefore && !canAfford(goods, item.data?.payBefore, ignoreResourceValidation))
                    }
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-500 disabled:bg-stone-600 disabled:text-stone-400 text-white text-xs font-bold rounded transition-colors"
                  >
                    Execute
                  </button>
                  {item.optional && (
                    <button 
                      onClick={() => onSkip(item.id)}
                      disabled={anyDoing}
                      className="px-3 py-1 bg-stone-600 hover:bg-stone-500 disabled:bg-stone-700 disabled:text-stone-500 text-white text-xs font-bold rounded transition-colors"
                    >
                      Skip
                    </button>
                  )}
                </div>
              )}

              {item.status === 'DOING' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-orange-400 animate-pulse">In Progress...</span>
                  {item.optional && (
                    <button 
                      onClick={() => onSkip(item.id)}
                      className="px-2 py-0.5 bg-stone-600 hover:bg-stone-500 text-white text-[10px] font-bold rounded transition-colors"
                    >
                      Skip
                    </button>
                  )}
                </div>
              )}
            </div>

            {item.status === 'TODO' && item.actionType === 'CHOICE' && (
              <div className="mt-3 space-y-2 pl-6">
                {item.data.options.map((opt: any, idx: number) => {
                  const affordable = canAfford(goods, opt.cost, ignoreResourceValidation);
                  return (
                    <button
                      key={idx}
                      onClick={() => onChoose(item.id, idx)}
                      disabled={anyDoing || !affordable}
                      className={`w-full text-left px-3 py-2 rounded border text-sm flex items-center justify-between transition-colors
                        ${(!anyDoing && affordable) ? 'bg-stone-800 border-stone-600 hover:bg-stone-700 hover:border-orange-500 text-stone-300' : 'bg-stone-900 border-stone-800 text-stone-600 cursor-not-allowed'}
                      `}
                    >
                      <span>{opt.label}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  );
                })}
                {item.optional && (
                  <button
                    onClick={() => onSkip(item.id)}
                    disabled={anyDoing}
                    className="w-full text-center px-3 py-2 rounded border border-stone-600 bg-stone-700 hover:bg-stone-600 disabled:bg-stone-800 disabled:text-stone-500 text-stone-300 text-sm font-bold transition-colors"
                  >
                    Skip Choice
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {allDoneOrSkipped && checklist.length > 0 && (
        <button
          onClick={onFinishTurn}
          className="mt-6 w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-[1.02]"
        >
          Finish Turn
        </button>
      )}
    </div>
  );
};
