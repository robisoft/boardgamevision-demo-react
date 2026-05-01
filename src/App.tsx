import { useGameState } from './hooks/useGameState'
import { useGameStateSocket } from './hooks/useGameStateSocket'
import ConnectionStatus from './components/ConnectionStatus'
import type { ConnectionStatusValue } from './components/ConnectionStatus'
import PlayerBoard from './components/PlayerBoard'
import Footer from './components/Footer'
import type { GameState } from './types/boardgamevision'

function getUrlParams(): { roomId: string; transport: string } {
  const params = new URLSearchParams(window.location.search)
  return {
    roomId: params.get('roomId') ?? '',
    transport: params.get('transport') ?? '',
  }
}


export default function App(): React.JSX.Element {
  const { roomId, transport } = getUrlParams()

  const missingParams: string[] = []
  if (!roomId) missingParams.push('roomId')
  if (!transport) missingParams.push('transport')

  if (missingParams.length > 0) {
    return (
      <>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-red-500 text-sm">
            {missingParams.length === 1
              ? `Parametro mancante nell'URL: ${missingParams[0]}`
              : `Parametri mancanti nell'URL: ${missingParams.join(', ')}`}
          </p>
        </div>
        <Footer />
      </>
    )
  }

  if (transport !== 'signalr' && transport !== 'socketio') {
    return (
      <>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-red-500 text-sm">
            Valore non valido per il parametro &quot;transport&quot;: &quot;{transport}&quot;. Valori ammessi: signalr, socketio
          </p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <GameView roomId={roomId} transport={transport} />
      <Footer />
    </>
  )
}

interface GameViewProps {
  roomId: string
  transport: 'signalr' | 'socketio'
}

function GameView({ roomId, transport }: GameViewProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex flex-col flex-1">
        {transport === 'signalr' ? (
          <SignalRPanel roomId={roomId} />
        ) : (
          <SocketIOPanel roomId={roomId} />
        )}
      </div>
    </div>
  )
}

function SignalRPanel({ roomId }: { roomId: string }): React.JSX.Element {
  const { gameState, nn1, nn2, status, error, initialLoading } = useGameState({ roomId })
  return <GamePanel label="SignalR" gameState={gameState} nn1={nn1} nn2={nn2} status={status} error={error} initialLoading={initialLoading} />
}

function SocketIOPanel({ roomId }: { roomId: string }): React.JSX.Element {
  const { gameState, nn1, nn2, status, error, initialLoading } = useGameStateSocket({ roomId })
  return <GamePanel label="SocketIO" gameState={gameState} nn1={nn1} nn2={nn2} status={status} error={error} initialLoading={initialLoading} />
}

interface GamePanelProps {
  label: string
  gameState: GameState | null
  nn1: string
  nn2: string
  status: ConnectionStatusValue
  error: string | null
  initialLoading: boolean
}

function GamePanel({ label, gameState, nn1, nn2, status, error, initialLoading }: GamePanelProps): React.JSX.Element {
  const changes = {
    added:   gameState?.added   ?? [],
    removed: gameState?.removed ?? [],
    moved:   gameState?.moved   ?? [],
    rotated: gameState?.rotated ?? [],
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-gray-800 text-gray-200 border-b border-gray-300">
        {label}
      </div>
      <ConnectionStatus status={status} error={error} />
      {gameState ? (
        <div className="flex flex-1">
          <PlayerBoard title={nn1 || 'Player 1'} zones={gameState.p1} player={1} changes={changes} />
          <div className="w-px bg-gray-200" />
          <PlayerBoard title={nn2 || 'Player 2'} zones={gameState.p2} player={2} changes={changes} />
        </div>
      ) : !initialLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">In attesa dei dati di gioco...</p>
        </div>
      ) : null}
    </div>
  )
}
