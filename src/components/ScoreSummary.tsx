import React from 'react';
import { GameState } from '../types/game';
import { Trophy, Coins, Home, Star } from 'lucide-react';
import { calculateScore } from '../utils/scoring';

interface Props {
  gameState: GameState;
  onPlayAgain: () => void;
}

export const ScoreSummary: React.FC<Props> = ({ gameState, onPlayAgain }) => {
  const { baseVP, goldVP, bonusVP, totalVP, bonusDetails } = calculateScore(gameState);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-800 border-2 border-orange-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4 border border-orange-500/50">
            <Trophy className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-3xl font-bold text-stone-100">Game Over</h2>
          <p className="text-stone-400 mt-2">Final Score Breakdown</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-3 bg-stone-900/50 rounded-lg border border-stone-700">
            <div className="flex items-center gap-3 text-stone-300">
              <Home className="w-5 h-5 text-blue-400" />
              <span>Furnished Rooms</span>
            </div>
            <span className="font-bold text-xl text-stone-100">{baseVP}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-stone-900/50 rounded-lg border border-stone-700">
            <div className="flex items-center gap-3 text-stone-300">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span>Gold (1 VP each)</span>
            </div>
            <span className="font-bold text-xl text-stone-100">{goldVP}</span>
          </div>

          {bonusDetails.length > 0 && (
            <div className="p-3 bg-stone-900/50 rounded-lg border border-stone-700 space-y-2">
              <div className="flex items-center gap-3 text-stone-300 mb-3">
                <Star className="w-5 h-5 text-purple-400" />
                <span>End Game Bonuses</span>
              </div>
              {bonusDetails.map((bonus, idx) => (
                <div key={idx} className="flex justify-between text-sm pl-8">
                  <span className="text-stone-400">{bonus.name}</span>
                  <span className="font-bold text-stone-200">+{bonus.vp}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-stone-700 pt-2 mt-2 pl-8">
                <span className="text-stone-300 font-medium">Total Bonus</span>
                <span className="font-bold text-lg text-purple-400">{bonusVP}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-orange-900/20 rounded-xl border border-orange-500/30 mb-8">
          <span className="text-xl font-bold text-orange-200">Total Score</span>
          <span className="text-4xl font-black text-orange-400">{totalVP}</span>
        </div>

        <button
          onClick={onPlayAgain}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
