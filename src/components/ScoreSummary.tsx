import React, { useEffect, useState } from 'react';
import { GameState } from '../types/game';
import { Trophy, Coins, Home, Star, User, Loader2, History, Calendar } from 'lucide-react';
import { calculateScore } from '../utils/scoring';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, where, getDocs } from 'firebase/firestore';

interface Props {
  gameState: GameState;
  onPlayAgain: () => void;
  onClose: () => void;
  viewOnly?: boolean;
}

interface GameHistoryEntry {
  id: string;
  userId: string;
  score: number;
  timestamp: any;
}

export const ScoreSummary: React.FC<Props> = ({ gameState, onPlayAgain, onClose, viewOnly = false }) => {
  const { baseVP, goldVP, bonusVP, totalVP, bonusDetails } = calculateScore(gameState);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [newlySavedId, setNewlySavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      setIsLoadingHistory(false);
      return;
    }

    const q = query(
      collection(db, 'game_logs'), 
      where('userId', '==', auth.currentUser.uid),
      limit(50) // Fetch enough to find top 10
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GameHistoryEntry[];
      
      // Sort by score descending, then by timestamp descending
      const sortedEntries = [...entries].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const timeA = a.timestamp?.toMillis?.() || 0;
        const timeB = b.timestamp?.toMillis?.() || 0;
        return timeB - timeA;
      });
      
      setHistory(sortedEntries.slice(0, 10));
      setIsLoadingHistory(false);
    }, (error) => {
      console.error("History error:", error);
      setIsLoadingHistory(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const saveScore = async () => {
    if (!auth.currentUser || hasSaved || isSaving || gameState.uiState.mode !== 'GAME_OVER') return;

    setIsSaving(true);
    try {
      // Check if this gameId has already been saved to avoid duplicates
      const q = query(
        collection(db, 'game_logs'),
        where('userId', '==', auth.currentUser.uid),
        where('gameId', '==', gameState.gameId),
        limit(1)
      );
      
      const existingDocs = await getDocs(q);
      if (!existingDocs.empty) {
        setNewlySavedId(existingDocs.docs[0].id);
        setHasSaved(true);
        return;
      }

      const logData = {
        userId: auth.currentUser.uid,
        gameId: gameState.gameId,
        score: totalVP,
        gameState: JSON.parse(JSON.stringify(gameState)), // Deep copy to avoid circular refs if any
        timestamp: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'game_logs'), logData);
      setNewlySavedId(docRef.id);
      
      setHasSaved(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'game_logs');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (auth.currentUser && !hasSaved && gameState.uiState.mode === 'GAME_OVER') {
      saveScore();
    }
  }, [auth.currentUser, gameState.uiState.mode]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-stone-800 border-2 border-orange-500/50 rounded-2xl p-8 max-w-4xl w-full shadow-2xl my-8 flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4 border border-orange-500/50">
              <Trophy className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-3xl font-bold text-stone-100">{gameState.uiState.mode === 'GAME_OVER' ? 'Game Over' : 'Current Standing'}</h2>
            <p className="text-stone-400 mt-2">{gameState.uiState.mode === 'GAME_OVER' ? 'Final Score Breakdown' : 'Your progress so far'}</p>
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

          <div className="flex flex-col gap-3">
            {gameState.uiState.mode === 'GAME_OVER' && (
              <button
                onClick={onPlayAgain}
                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg"
              >
                Play Again
              </button>
            )}
            <button
              onClick={onClose}
              className={`w-full py-3 font-medium rounded-xl transition-colors border ${
                gameState.uiState.mode !== 'GAME_OVER' 
                  ? 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500' 
                  : 'bg-stone-700 hover:bg-stone-600 text-stone-200 border-stone-600'
              }`}
            >
              {gameState.uiState.mode !== 'GAME_OVER' ? 'Back to Game' : 'Review Board'}
            </button>
          </div>
        </div>

        <div className="flex-1 border-l border-stone-700 pl-0 md:pl-8 pt-8 md:pt-0">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-bold text-stone-100">High Scores</h3>
          </div>

          {!auth.currentUser ? (
            <div className="bg-stone-900/50 rounded-xl p-6 text-center border border-stone-700">
              <User className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <p className="text-stone-400 text-sm mb-4">Sign in to save your scores and see your high scores!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No high scores yet.</p>
                </div>
              ) : (
                history.map((entry, idx) => (
                  <div 
                    key={entry.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      entry.id === newlySavedId 
                        ? 'bg-orange-900/40 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
                        : 'bg-stone-900/50 border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center font-bold ${
                        idx === 0 ? 'text-yellow-400' : 
                        idx === 1 ? 'text-stone-300' : 
                        idx === 2 ? 'text-orange-400' : 'text-stone-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-stone-400 text-[10px]">
                          {formatDate(entry.timestamp)}
                        </span>
                        <span className="text-stone-200 font-medium">
                          Score: <span className="text-orange-400 font-bold">{entry.score}</span>
                        </span>
                      </div>
                    </div>
                    {entry.id === newlySavedId && (
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider bg-orange-400/10 px-2 py-0.5 rounded">
                        New!
                      </span>
                    )}
                  </div>
                ))
              )}
              {isSaving && (
                <div className="flex items-center justify-center gap-2 text-stone-400 text-sm py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving your score...
                </div>
              )}
              {hasSaved && (
                <div className="text-center text-green-400 text-xs py-2">
                  Score saved to your history!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
