import React from 'react';
import { ActionBoardState } from '../types/game';

interface Props {
  board: ActionBoardState;
  onTakeAction: (actionId: string) => void;
}

export const ActionBoard: React.FC<Props> = ({ board, onTakeAction }) => {
  return (
    <div className="bg-stone-800 p-4 rounded-xl shadow-lg border border-stone-700">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-4">
          <h2 className="text-stone-300 text-sm font-bold uppercase tracking-wider">Action Board</h2>
          <div className="flex items-center gap-3">
            <div className="bg-stone-900 px-2 py-1 rounded border border-stone-700 flex items-center gap-2">
              <span className="text-stone-400 text-[10px] uppercase">Round</span>
              <span className="text-orange-400 font-bold text-sm">{board.round} / 7</span>
            </div>
            <div className="bg-stone-900 px-2 py-1 rounded border border-stone-700 flex items-center gap-2">
              <span className="text-stone-400 text-[10px] uppercase">Turn</span>
              <span className="text-orange-400 font-bold text-sm">{board.turn} / {board.maxTurns}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-stone-400 text-[10px] uppercase tracking-wider hidden sm:inline">Upcoming:</span>
          <div className="flex gap-1">
            {board.futureActions.map((action, idx) => (
              <div 
                key={`${action.id}-${idx}`} 
                className="w-8 h-10 bg-stone-900 border border-stone-700 rounded flex items-center justify-center shadow-inner"
                title={`Stage ${action.stage} Action Tile`}
              >
                <span className="text-stone-500 font-bold text-xs">{action.stage}</span>
              </div>
            ))}
            {board.futureActions.length === 0 && (
              <span className="text-stone-500 text-xs italic">None</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
        {board.availableActions.map(action => {
          const isUsed = board.usedActionsThisRound.includes(action.id);
          return (
            <button
              key={action.id}
              disabled={isUsed}
              onClick={() => onTakeAction(action.id)}
              title={action.description}
              className={`w-32 h-32 p-2 rounded-lg border-2 text-center transition-all flex flex-col items-center justify-center flex-shrink-0 snap-start relative
                ${isUsed 
                  ? 'bg-stone-900 border-stone-800 opacity-40 cursor-not-allowed' 
                  : 'bg-stone-700 border-stone-500 hover:border-orange-400 hover:bg-stone-600 cursor-pointer shadow-md'
                }`}
            >
              <span className="font-bold text-stone-100 text-xs mb-1 leading-tight">{action.name}</span>
              <span className="text-[9px] text-stone-400 leading-tight overflow-hidden text-ellipsis line-clamp-4">{action.description}</span>
              {isUsed && <span className="absolute bottom-1 bg-stone-900/80 px-2 py-0.5 rounded text-red-400 text-[10px] font-bold uppercase tracking-wider">Used</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
