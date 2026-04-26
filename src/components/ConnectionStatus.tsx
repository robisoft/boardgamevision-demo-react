export type ConnectionStatusValue =
  | 'connected'
  | 'connecting'
  | 'reconnecting'
  | 'error'
  | 'disconnected'

interface StatusConfig {
  bg: string
  text: string | null
  pulse?: boolean
}

const STATUS_CONFIG: Record<ConnectionStatusValue, StatusConfig> = {
  connected:    { bg: 'bg-green-400',  text: null },
  connecting:   { bg: 'bg-yellow-400', text: 'Connessione in corso...',   pulse: true },
  reconnecting: { bg: 'bg-orange-400', text: 'Riconnessione in corso...', pulse: true },
  error:        { bg: 'bg-red-500',    text: 'Errore di connessione' },
  disconnected: { bg: 'bg-gray-400',   text: 'Disconnesso' },
}

interface ConnectionStatusProps {
  status: ConnectionStatusValue
  error: string | null
}

export default function ConnectionStatus({ status, error }: ConnectionStatusProps): React.JSX.Element {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.connecting

  if (status === 'connected') {
    return <div className={`w-full ${cfg.bg}`} style={{ height: '5px' }} />
  }

  return (
    <div
      className={`w-full ${cfg.bg} flex items-center gap-2 px-4`}
      style={{ height: '5px', minHeight: '2rem' }}
    >
      <span
        className={`w-2 h-2 rounded-full bg-white flex-shrink-0 ${cfg.pulse ? 'animate-pulse' : ''}`}
      />
      <span className="text-white text-sm font-medium">{cfg.text}</span>
      {error && <span className="text-white text-xs opacity-80">— {error}</span>}
    </div>
  )
}
