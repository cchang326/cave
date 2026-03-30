import React from 'react';
import { ChecklistItem, GoodsState } from '../types/game';
import { Check, X, Play, ChevronRight, Undo2, Square, CheckSquare, Circle, Info } from 'lucide-react';

interface Props {
  checklist: ChecklistItem[];
  goods: GoodsState;
  onExecute: (id: string) => void;
  onSkip: (id: string) => void;
  onChoose: (id: string, optionIndex: number) => void;
  onFinishTurn: () => void;
  onUndoAction?: () => void;
  canUndoAction?: boolean;
}

function canAfford(goods: GoodsState, cost?: Partial<GoodsState>, condition?: any): boolean {
  if (cost) {
    for (const key in cost) {
      const k = key as keyof GoodsState;
      if (goods[k] < (cost[k] || 0)) return false;
    }
  }

  if (condition) {
    if (condition.maxStone !== undefined && goods.stone > condition.maxStone) return false;
    if (condition.minGold !== undefined && goods.gold < condition.minGold) return false;
  }

  return true;
}

export const ChecklistUI: React.FC<Props> = ({ checklist, goods, onExecute, onSkip, onChoose, onFinishTurn, onUndoAction, canUndoAction }) => {
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
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-1 flex-shrink-0">
                  {item.status === 'DONE' && <CheckSquare className="w-4 h-4 text-green-500" />}
                  {item.status === 'SKIPPED' && <X className="w-4 h-4 text-stone-500" />}
                  {item.status === 'DOING' && <Play className="w-4 h-4 text-orange-400 animate-pulse" />}
                  {item.status === 'TODO' && (
                    item.actionType === 'CHOICE' 
                      ? <Info className="w-4 h-4 text-orange-400" />
                      : <Square className="w-4 h-4 text-stone-500" />
                  )}
                </div>
                <span className={`font-medium text-sm leading-tight ${item.status === 'DONE' || item.status === 'SKIPPED' ? 'line-through opacity-60' : ''}`}>
                  {item.text}
                </span>
              </div>
              
              {item.status === 'TODO' && item.actionType !== 'CHOICE' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => onExecute(item.id)}
                    disabled={
                      anyDoing ||
                      (item.actionType === 'PAY' && !canAfford(goods, item.data?.goods)) ||
                      (item.data?.payBefore && !canAfford(goods, item.data?.payBefore)) ||
                      (item.data?.condition && !canAfford(goods, undefined, item.data.condition))
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
              <div className="mt-4 space-y-2 pl-7">
                <div className="text-[10px] font-bold text-orange-400/70 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <div className="h-px bg-orange-500/20 flex-1" />
                  Choose One
                  <div className="h-px bg-orange-500/20 flex-1" />
                </div>
                {item.data.options.map((opt: any, idx: number) => {
                  const affordable = canAfford(goods, opt.cost);
                  return (
                    <button
                      key={idx}
                      onClick={() => onChoose(item.id, idx)}
                      disabled={anyDoing || !affordable}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm flex items-center justify-between transition-all group
                        ${(!anyDoing && affordable) ? 'bg-stone-800/50 border-stone-600 hover:bg-stone-700 hover:border-orange-500/50 text-stone-300' : 'bg-stone-900/30 border-stone-800 text-stone-600 cursor-not-allowed'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Circle className={`w-3 h-3 flex-shrink-0 transition-colors ${(!anyDoing && affordable) ? 'text-stone-500 group-hover:text-orange-400' : 'text-stone-700'}`} />
                        <span className="font-medium">{opt.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${(!anyDoing && affordable) ? 'text-stone-600 group-hover:translate-x-1 group-hover:text-orange-400' : 'text-stone-800'}`} />
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
