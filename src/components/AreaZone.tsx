import type { ZoneState } from '../types/boardgamevision'
import CardTile from './CardTile'

interface AreaZoneProps {
  zone: ZoneState
}

export default function AreaZone({ zone }: AreaZoneProps): React.JSX.Element {
  return (
    <div className="mb-6">
      <p className="text-gray-500 text-xs uppercase tracking-widest mb-2 font-medium">
        {zone.label}:
      </p>
      <div className="relative w-full h-40 border border-dashed border-gray-200 rounded">
        {zone.cards.length === 0 ? (
          <span className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm italic">
            nessuna carta
          </span>
        ) : (
          zone.cards.map((card, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${card.x * 100}%`,
                top: `${card.y * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <CardTile card={card} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
