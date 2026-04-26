import type { Card } from '../types/boardgamevision'

interface CardTileProps {
  card: Card
}

export default function CardTile({ card }: CardTileProps): React.JSX.Element {
  return (
    <div
      className="w-12 h-12 border-2 border-gray-400 flex items-center justify-center text-gray-700 font-semibold text-sm bg-white shadow-sm flex-shrink-0"
      style={{ transform: `rotate(${card.r}deg)` }}
    >
      {card.id}
    </div>
  )
}
