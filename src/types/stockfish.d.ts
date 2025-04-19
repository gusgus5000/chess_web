declare module 'stockfish' {
  export default function stockfish(): {
    onmessage: (msg: { data: string }) => void;
    postMessage: (command: string) => void;
  };
}