export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultySettings {
  depth: number;
  moveTime: number;
  skill: number;
  earlyMoveThreshold?: number;
}

class ChessAI {
  private engine: Worker | null = null;
  private isReady: boolean = false;
  private difficulty: Difficulty = 'medium';

  private difficultySettings: Record<Difficulty, DifficultySettings> = {
    easy: { depth: 5, moveTime: 200, skill: 3, earlyMoveThreshold: 50 },
    medium: { depth: 8, moveTime: 500, skill: 10, earlyMoveThreshold: 150 },
    hard: { depth: 12, moveTime: 1000, skill: 20 }
  };

  constructor(initialDifficulty: Difficulty = 'medium') {
    this.difficulty = initialDifficulty;
    this.initEngine();
  }

  private async initEngine() {
    try {
      this.engine = new Worker('/stockfish.worker.js');
      
      this.engine.onmessage = (e: MessageEvent) => {
        const data = e.data;
        if (data === 'uciok') {
          this.engine?.postMessage('isready');
        } else if (data === 'readyok') {
          this.isReady = true;
          this.configureEngine();
        }
      };

      this.engine.postMessage('uci');
    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
    }
  }

  private configureEngine() {
    if (!this.engine) return;
    const settings = this.difficultySettings[this.difficulty];
    
    // Configure Stockfish settings for optimal speed/strength balance
    this.engine.postMessage('setoption name Skill Level value ' + settings.skill);
    this.engine.postMessage('setoption name MultiPV value 1');
    this.engine.postMessage('setoption name Contempt value 0');
    this.engine.postMessage('setoption name Hash value 16');
    this.engine.postMessage('setoption name Threads value 2');
    this.engine.postMessage('setoption name Move Overhead value 10');
  }

  setDifficulty(difficulty: Difficulty) {
    this.difficulty = difficulty;
    if (this.isReady) {
      this.configureEngine();
    }
  }

  async getBestMove(fen: string): Promise<string> {
    return new Promise((resolve) => {
      if (!this.engine || !this.isReady) {
        setTimeout(() => this.getBestMove(fen).then(resolve), 100);
        return;
      }

      const settings = this.difficultySettings[this.difficulty];
      let hasEarlyMove = false;

      const messageHandler = (e: MessageEvent) => {
        const data = e.data;
        
        // Handle early move for easier difficulties
        if (settings.earlyMoveThreshold && data.startsWith('info') && !hasEarlyMove) {
          const match = data.match(/score cp (-?\d+)/);
          if (match && data.includes('depth')) {
            const score = parseInt(match[1]);
            const currentDepth = parseInt(data.match(/depth (\d+)/)[1]);
            
            // Make a move early if we have a clearly good position
            if (currentDepth >= 4 && Math.abs(score) > settings.earlyMoveThreshold) {
              hasEarlyMove = true;
              this.engine?.postMessage('stop');
            }
          }
        }

        if (data.startsWith('bestmove')) {
          const move = data.split(' ')[1];
          this.engine?.removeEventListener('message', messageHandler);
          resolve(move);
        }
      };

      this.engine.addEventListener('message', messageHandler);
      this.engine.postMessage(`position fen ${fen}`);
      this.engine.postMessage(`go movetime ${settings.moveTime} depth ${settings.depth}`);
    });
  }

  destroy() {
    if (this.engine) {
      this.engine.postMessage('quit');
      this.engine.terminate();
      this.engine = null;
    }
  }
}

export default ChessAI;