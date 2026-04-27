import { useEffect, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import type { GameState } from '../types/boardgamevision'
import type { ConnectionStatusValue } from '../components/ConnectionStatus'
import { SIGNALR_ENDPOINT, GAME_STATE_EVENT } from '../config'
import { normalizeGameState, normalizeInitialGameState } from '../utils/normalizeGameState'

interface UseGameStateOptions {
  roomId: string
}

interface UseGameStateResult {
  gameState: GameState | null
  nn1: string
  nn2: string
  status: ConnectionStatusValue
  error: string | null
  initialLoading: boolean
}

export function useGameState({ roomId }: UseGameStateOptions): UseGameStateResult {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [nn1, setNn1] = useState('')
  const [nn2, setNn2] = useState('')
  const [status, setStatus] = useState<ConnectionStatusValue>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const hubUrl = `${SIGNALR_ENDPOINT}?roomId=${encodeURIComponent(roomId)}`

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connection.on(GAME_STATE_EVENT, (payload: unknown) => {
      setGameState(normalizeGameState(payload))
      setStatus('connected')
      setError(null)
      console.log(payload)
    })

    connection.onreconnecting((err?: Error) => {
      setStatus('reconnecting')
      setError(err?.message ?? null)
    })

    connection.onreconnected(() => {
      setStatus('connected')
      setError(null)
    })

    connection.onclose((err?: Error) => {
      setStatus('disconnected')
      setError(err?.message ?? 'Connessione chiusa')
    })

    connection
      .start()
      .then(async () => {
        setStatus('connected')
        try {
          const initial: unknown = await connection.invoke('GetGameState', roomId)
          if (initial) {
            const normalized = normalizeInitialGameState(initial)
            setNn1(normalized.nn1)
            setNn2(normalized.nn2)
            setGameState({ p1: normalized.p1, p2: normalized.p2 })
          }
        } catch {
          // initial state not available, wait for push
        } finally {
          setInitialLoading(false)
        }
      })
      .catch(() => {
        setStatus('disconnected')
        setError(null)
      })

    return () => {
      connection.off(GAME_STATE_EVENT)
      void connection.stop()
    }
  }, [roomId])

  return { gameState, nn1, nn2, status, error, initialLoading }
}
