import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import type { GameState } from '../types/boardgamevision'
import type { ConnectionStatusValue } from '../components/ConnectionStatus'
import { SOCKETIO_ENDPOINT, SOCKETIO_PATH, GAME_STATE_EVENT } from '../config'
import { normalizeGameState, normalizeInitialGameState } from '../utils/normalizeGameState'

interface UseGameStateSocketOptions {
  roomId: string
}

interface UseGameStateSocketResult {
  gameState: GameState | null
  nn1: string
  nn2: string
  status: ConnectionStatusValue
  error: string | null
  initialLoading: boolean
}

export function useGameStateSocket({ roomId }: UseGameStateSocketOptions): UseGameStateSocketResult {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [nn1, setNn1] = useState('')
  const [nn2, setNn2] = useState('')
  const [status, setStatus] = useState<ConnectionStatusValue>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const socket = io(SOCKETIO_ENDPOINT, {
      path: SOCKETIO_PATH,
      query: { roomId },
      transports: ['websocket'],
      reconnection: true,
    })

    socket.on('connect', () => {
      setStatus('connected')
      setError(null)
      socket.emit('GetGameState', roomId, (response: unknown) => {
        if (response) {
          const normalized = normalizeInitialGameState(response)
          setNn1(normalized.nn1)
          setNn2(normalized.nn2)
          setGameState({ p1: normalized.p1, p2: normalized.p2 })
        }
        setInitialLoading(false)
      })
      // Fallback: if the server doesn't call the ack, stop showing the spinner
      setTimeout(() => setInitialLoading(false), 5000)
    })

    socket.on(GAME_STATE_EVENT, (payload: unknown) => {
      setGameState(normalizeGameState(payload))
      setStatus('connected')
      setError(null)
      console.log(payload)
    })

    socket.on('disconnect', (reason: string) => {
      setStatus('disconnected')
      setError(reason)
    })

    socket.on('connect_error', (err: Error) => {
      setStatus('error')
      setError(err.message)
    })

    socket.io.on('reconnect_attempt', () => {
      setStatus('reconnecting')
    })

    socket.io.on('reconnect', () => {
      setStatus('connected')
      setError(null)
    })

    return () => {
      socket.disconnect()
    }
  }, [roomId])

  return { gameState, nn1, nn2, status, error, initialLoading }
}
