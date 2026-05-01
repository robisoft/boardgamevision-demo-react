# Boardgame Vision - Demo React

Questa applicazione React dimostra come uno sviluppatore di giochi da tavolo puo' integrare la piattaforma **Boardgame Vision** nel proprio gioco.

Boardgame Vision utilizza la computer vision per rilevare carte fisiche sul tavolo (tramite marker ArUco) e invia in tempo reale un oggetto **GameState** all'applicazione di gioco ogni volta che una carta viene aggiunta, rimossa, spostata o ruotata.

## Come funziona

```
Tavolo fisico con carte (marker ArUco)
         |
         v
  Boardgame Vision (computer vision)
         |
         v
  Server WebSocket (SignalR o SocketIO)
         |
         v
  App di gioco (riceve GameState)
```

1. La telecamera inquadra il tavolo da gioco
2. Boardgame Vision riconosce le carte tramite i marker ArUco stampati su ciascuna carta
3. Il sistema determina in quale zona si trova ogni carta e la sua rotazione
4. Ad ogni cambiamento, il server invia un evento `game-state` contenente il nuovo stato completo del gioco

## Struttura del GameState

### Connessione iniziale: `InitialGameState`

Alla connessione, il client richiede lo stato iniziale. La risposta contiene:

```typescript
interface InitialGameState {
  nn1: string;       // Nome del giocatore 1
  nn2: string;       // Nome del giocatore 2
  p1: ZoneState[];   // Zone del giocatore 1
  p2: ZoneState[];   // Zone del giocatore 2
}
```

### Aggiornamenti in tempo reale: `GameState`

Ad ogni cambiamento sul tavolo, il server invia un oggetto `GameState`:

```typescript
interface GameState {
  p1: ZoneState[];        // Stato completo delle zone del giocatore 1
  p2: ZoneState[];        // Stato completo delle zone del giocatore 2
  added?: CardAdded[];    // Carte appena aggiunte
  removed?: CardRemoved[];// Carte appena rimosse
  moved?: CardMoved[];    // Carte appena spostate tra zone
  rotated?: CardRotated[];// Carte appena ruotate
}
```

I campi `added`, `removed`, `moved` e `rotated` sono opzionali e presenti solo quando il relativo evento si e' verificato.

### Tipi di supporto

**ZoneState** - Rappresenta una zona del tavolo con le sue carte:

```typescript
interface ZoneState {
  zone: string;   // Nome della zona (es. "difesa", "centro", "attacco")
  cards: Card[];  // Carte presenti in questa zona
}
```

**Card** - Una singola carta identificata dal suo marker:

```typescript
interface Card {
  id: number;  // ID del marker ArUco (identifica il tipo di carta)
  r: number;   // Rotazione in gradi (0, 90, 180, 270)
}
```

### Eventi di cambiamento

**CardAdded** - Una carta e' stata posizionata sul tavolo:

```typescript
interface CardAdded {
  player: 1 | 2;   // Giocatore a cui appartiene la zona
  zone: string;     // Nome della zona
  card: Card;       // La carta aggiunta (id + rotazione)
}
```

**CardRemoved** - Una carta e' stata rimossa dal tavolo:

```typescript
interface CardRemoved {
  player: 1 | 2;   // Giocatore a cui appartiene la zona
  zone: string;     // Nome della zona
  cardId: number;   // ID della carta rimossa
}
```

**CardMoved** - Una carta e' stata spostata da una zona a un'altra:

```typescript
interface CardMoved {
  fromPlayer: 1 | 2;   // Giocatore di origine
  fromZone: string;     // Zona di origine
  toPlayer: 1 | 2;     // Giocatore di destinazione
  toZone: string;       // Zona di destinazione
  cardId: number;       // ID della carta
  rotation: number;     // Rotazione nella nuova posizione
}
```

**CardRotated** - Una carta e' stata ruotata nella sua posizione:

```typescript
interface CardRotated {
  player: 1 | 2;       // Giocatore
  zone: string;         // Zona
  cardId: number;       // ID della carta
  fromRotation: number; // Rotazione precedente
  toRotation: number;   // Nuova rotazione
}
```

## Esempio di GameState

```json
{
  "p1": [
    {
      "zone": "difesa",
      "cards": [
        { "id": 4, "r": 0 },
        { "id": 5, "r": 90 }
      ]
    },
    {
      "zone": "centro",
      "cards": [
        { "id": 1, "r": 0 }
      ]
    },
    {
      "zone": "attacco",
      "cards": []
    }
  ],
  "p2": [
    {
      "zone": "difesa",
      "cards": []
    },
    {
      "zone": "centro",
      "cards": [
        { "id": 2, "r": 180 }
      ]
    },
    {
      "zone": "attacco",
      "cards": [
        { "id": 3, "r": 0 }
      ]
    }
  ],
  "added": [
    { "player": 1, "zone": "difesa", "card": { "id": 5, "r": 90 } }
  ]
}
```

## Connessione al server

L'app supporta due protocolli di trasporto: **SignalR** e **SocketIO**.

### Parametri URL richiesti

L'app si aspetta due query parameter nell'URL:

| Parametro   | Descrizione                          | Valori ammessi         |
|-------------|--------------------------------------|------------------------|
| `roomId`    | Identificativo della stanza di gioco | Qualsiasi stringa      |
| `transport` | Protocollo di connessione            | `signalr` o `socketio` |

Esempio: `https://boardgamevision.com/demo-react/?roomId=room-42&transport=signalr`

### SignalR

- Endpoint: `https://boardgamevision.com/core/gameHub?roomId={roomId}`
- Stato iniziale: `connection.invoke('GetGameState', roomId)` -> restituisce `InitialGameState`
- Aggiornamenti: evento `game-state` -> riceve `GameState`

### SocketIO

- Endpoint: `https://boardgamevision.com` con path `/gameSocket`
- Query parameter: `roomId`
- Stato iniziale: `socket.emit('GetGameState', roomId, callback)` -> la callback riceve `InitialGameState`
- Aggiornamenti: evento `game-state` -> riceve `GameState`

## Avvio del progetto in locale

```bash
# Installare le dipendenze
npm install

# Avviare il server di sviluppo
npm run dev
```

L'app sara' disponibile su `http://localhost:5173/demo-react/`.

## Tecnologie utilizzate

- React 18
- TypeScript
- Vite
- Tailwind CSS
- @microsoft/signalr
- socket.io-client
