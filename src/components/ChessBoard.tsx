import React, { useState } from 'react';
import { Chess, Square, Piece } from 'chess.js';

interface ChessBoardProps {
  onMove: (move: { from: string; to: string; promotion?: string }) => void;
  position: string;
  isPlayerTurn: boolean;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ onMove, position, isPlayerTurn }) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const chess = new Chess(position);

  const renderSquare = (i: number) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const square = `${String.fromCharCode(97 + col)}${8 - row}` as Square;
    const piece = chess.get(square);
    const isDark = (row + col) % 2 === 1;
    const isSelected = selectedSquare === square;

    return (
      <div
        key={square}
        className={`square ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''}`}
        onClick={() => handleSquarePress(square)}
      >
        {piece && (
          <span className="piece">
            {getPieceSymbol(piece.type, piece.color)}
          </span>
        )}
      </div>
    );
  };

  const handleSquarePress = (square: Square) => {
    if (!isPlayerTurn) return;

    if (selectedSquare === null) {
      const piece = chess.get(square);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      }
    } else {
      const move = {
        from: selectedSquare,
        to: square,
        promotion: 'q',
      };

      try {
        const result = chess.move(move);
        if (result) {
          onMove(move);
        }
      } catch (e) {
        // Invalid move
      }
      setSelectedSquare(null);
    }
  };

  const getPieceSymbol = (type: Piece['type'], color: Piece['color']): string => {
    const pieces: { [key: string]: { [key: string]: string } } = {
      p: { w: '♙', b: '♟' },
      n: { w: '♘', b: '♞' },
      b: { w: '♗', b: '♝' },
      r: { w: '♖', b: '♜' },
      q: { w: '♕', b: '♛' },
      k: { w: '♔', b: '♚' },
    };
    return pieces[type][color];
  };

  return (
    <div className="board">
      {Array(64).fill(null).map((_, i) => renderSquare(i))}
    </div>
  );
};

export default ChessBoard;