import type { ZoneState, CardAdded, CardRemoved, CardMoved, CardRotated } from '../types/boardgamevision'
import AreaZone from './AreaZone'

interface PlayerChanges {
  added: CardAdded[]
  removed: CardRemoved[]
  moved: CardMoved[]
  rotated: CardRotated[]
}

interface PlayerBoardProps {
  title: string
  zones: ZoneState[]
  player: 1 | 2
  changes: PlayerChanges
}

function buildDescriptions(player: 1 | 2, { added, removed, moved, rotated }: PlayerChanges): string[] {
  const lines: string[] = []

  for (const c of added) {
    if (c.player === player)
      lines.push(`Carta #${c.card.id} aggiunta nella zona "${c.zone}"`)
  }

  for (const c of removed) {
    if (c.player === player)
      lines.push(`Carta #${c.cardId} rimossa dalla zona "${c.zone}"`)
  }

  for (const c of rotated) {
    if (c.player === player)
      lines.push(`Carta #${c.cardId} ruotata da ${c.fromRotation}° a ${c.toRotation}° nella zona "${c.zone}"`)
  }

  for (const c of moved) {
    if (c.fromPlayer === player && c.toPlayer === player) {
      lines.push(`Carta #${c.cardId} spostata da "${c.fromZone}" a "${c.toZone}"`)
    } else if (c.fromPlayer === player) {
      lines.push(`Carta #${c.cardId} spostata fuori dalla zona "${c.fromZone}"`)
    } else if (c.toPlayer === player) {
      lines.push(`Carta #${c.cardId} ricevuta nella zona "${c.toZone}"`)
    }
  }

  return lines
}

export default function PlayerBoard({ title, zones, player, changes }: PlayerBoardProps): React.JSX.Element {
  const descriptions = buildDescriptions(player, changes)

  return (
    <div className="flex-1 p-8">
      <h2 className="text-gray-700 text-lg font-semibold mb-6 pb-2 border-b border-gray-200">
        {title}
      </h2>
      {zones.map((zone, i) => (
        <AreaZone key={i} zone={zone} />
      ))}
      {descriptions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Modifiche recenti</p>
          <ul className="space-y-1">
            {descriptions.map((desc, i) => (
              <li key={i} className="text-sm text-gray-500">{desc}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
