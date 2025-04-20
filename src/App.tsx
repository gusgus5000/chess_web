import { useState, useEffect } from 'react'
import './App.css'
import { Chess } from 'chess.js'
import ChessBoard from './components/ChessBoard'
import ChessAI, { type Difficulty } from './components/ChessAI'

function App() {
  const [chess] = useState(new Chess())
  const [position, setPosition] = useState(chess.fen())
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [gameStatus, setGameStatus] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [ai] = useState(() => new ChessAI())
  const [isThinking, setIsThinking] = useState(false)

  useEffect(() => {
    // Check game status after each move
    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        setGameStatus(`Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins!`)
      } else if (chess.isDraw()) {
        setGameStatus('Game Over - Draw!')
      }
    } else if (chess.isCheck()) {
      setGameStatus('Check!')
    } else {
      setGameStatus(`${chess.turn() === 'w' ? 'White' : 'Black'}'s turn${isThinking ? ' (thinking...)' : ''}`)
    }
  }, [position, chess, isThinking])

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    ai.setDifficulty(newDifficulty);
  };

  const handlePlayerMove = async (move: { from: string; to: string; promotion?: string }) => {
    try {
      const result = chess.move(move)
      if (result) {
        setPosition(chess.fen())
        setIsPlayerTurn(false)
        setIsThinking(true)
        
        // AI's turn
        if (!chess.isGameOver()) {
          try {
            const aiMove = await ai.getBestMove(chess.fen())
            const [from, to] = [aiMove.slice(0, 2), aiMove.slice(2, 4)]
            const promotion = aiMove.length > 4 ? aiMove[4] : undefined
            
            chess.move({ from, to, promotion })
            setPosition(chess.fen())
          } catch (error) {
            console.error('AI move error:', error)
          } finally {
            setIsThinking(false)
            setIsPlayerTurn(true)
          }
        }
      }
    } catch (e) {
      console.error('Invalid move:', e)
    }
  }

  const resetGame = () => {
    chess.reset()
    setPosition(chess.fen())
    setIsPlayerTurn(true)
    setIsThinking(false)
    setGameStatus("White's turn")
  }

  return (
    <div className="game-container">
      <h1>Chess Game vs AI</h1>
      <div className="status">{gameStatus}</div>
      <div className="difficulty-controls">
        <label>Difficulty: </label>
        <select 
          value={difficulty} 
          onChange={(e) => handleDifficultyChange(e.target.value as Difficulty)}
          disabled={isThinking}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <ChessBoard 
        position={position}
        onMove={handlePlayerMove}
        isPlayerTurn={isPlayerTurn && !isThinking}
      />
      <div className="controls">
        <button onClick={resetGame} disabled={isThinking}>New Game</button>
      </div>
    </div>
  )
}

export default App
