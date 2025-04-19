class ChessAI {
  private engine: Worker | null = null;
  private isReady: boolean = false;

  constructor() {
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
        }
      };

      this.engine.postMessage('uci');
    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
    }
  }

  async getBestMove(fen: string, depth: number = 15): Promise<string> {
    return new Promise((resolve) => {
      if (!this.engine || !this.isReady) {
        setTimeout(() => this.getBestMove(fen, depth).then(resolve), 100);
        return;
      }

      const messageHandler = (e: MessageEvent) => {
        const data = e.data;
        if (data.startsWith('bestmove')) {
          const move = data.split(' ')[1];
          this.engine?.removeEventListener('message', messageHandler);
          resolve(move);
        }
      };

      this.engine.addEventListener('message', messageHandler);
      this.engine.postMessage(`position fen ${fen}`);
      this.engine.postMessage(`go depth ${depth}`);
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