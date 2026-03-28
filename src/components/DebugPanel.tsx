import React, { useState } from 'react';
import { Settings, X, Trophy } from 'lucide-react';
import { GameState } from '../types/game';
import { calculateScore } from '../utils/scoring';

export interface DebugState {
  ignoreResourceValidation: boolean;
}

interface Props {
  debugState: DebugState;
  setDebugState: React.Dispatch<React.SetStateAction<DebugState>>;
  gameState: GameState;
}

export const DebugPanel: React.FC<Props> = ({ debugState, setDebugState, gameState }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentScore = calculateScore(gameState);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-stone-800 p-3 rounded-full border border-stone-600 shadow-lg hover:bg-stone-700 transition-colors z-50 group"
        title="Open Debug Panel"
      >
        <Settings className="w-6 h-6 text-stone-400 group-hover:text-stone-200 transition-colors" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-stone-800 rounded-xl shadow-2xl border border-stone-600 z-50 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-stone-700 bg-stone-900/80">
        <h3 className="font-bold text-stone-200 flex items-center gap-2">
          <Settings className="w-4 h-4 text-orange-500" /> Debug Panel
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-5 space-y-6">
        <div className="bg-stone-900/50 p-4 rounded-lg border border-stone-700">
          <div className="flex items-center gap-2 mb-2 text-stone-300">
            <Trophy className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-sm uppercase tracking-wider">Current Score</span>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-xs text-stone-500 space-y-1">
              <div>Rooms: {currentScore.baseVP}</div>
              <div>Gold: {currentScore.goldVP}</div>
              <div>Bonus: {currentScore.bonusVP}</div>
            </div>
            <div className="text-3xl font-black text-orange-400">{currentScore.totalVP}</div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={debugState.ignoreResourceValidation}
                onChange={(e) => setDebugState(prev => ({ ...prev, ignoreResourceValidation: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </div>
            <span className="text-sm font-medium text-stone-300 group-hover:text-stone-100 transition-colors">
              Ignore Resource Costs
            </span>
          </label>
          <p className="text-xs text-stone-500 leading-relaxed">
            When enabled, you can perform actions, furnish rooms, and use room actions even if you don't have the required resources.
          </p>
        </div>
      </div>
    </div>
  );
};
