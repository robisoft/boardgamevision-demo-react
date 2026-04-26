import type { ZoneState } from '../types/boardgamevision'
import CardTile from './CardTile'

interface AreaZoneProps {
  zone: ZoneState
}

export default function AreaZone({ zone }: AreaZoneProps): React.JSX.Element {
  return (
    <div className="mb-6">
      <p className="text-gray-500 text-xs uppercase tracking-widest mb-2 font-medium">
        {zone.zone}:
      </p>
      <div className="flex flex-wrap gap-3 min-h-[3rem]">
        {zone.cards.length === 0 ? (
          <span className="text-gray-300 text-sm italic">nessuna carta</span>
        ) : (
          zone.cards.map((card, i) => <CardTile key={i} card={card} />)
        )}
      </div>
    </div>
  )
}
