# Boardgame Vision - Demo React

> [Read in English](README.md)

Questa applicazione React mostra come integrare la piattaforma **Boardgame Vision** nel proprio gioco.

Boardgame Vision utilizza la computer vision per rilevare carte fisiche sul tavolo (tramite marker ArUco) e invia in tempo reale un oggetto **GameState** al gioco ogni volta che una carta viene aggiunta, rimossa, spostata o ruotata.

## Contatti e funzionalità personalizzate

Hai in mente un gioco e ti servono delle funzionalità non presenti adesso su Boardgame Vision?
Vuoi utilizzare dadi personalizzati, miniature, una plancia unica anzichè 2 plance, ecc?

Scrivi direttamente a robi@robisoft.it, saremo ben lieti di sviluppare insieme le funzionalità che ti servono.

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
4. Ad ogni cambiamento, il server invia un evento `game-state` contenente il nuovo stato completo del gioco e per comodità le differenze con lo stat precedente

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
Lo stato iniziale si può richiedere in tre modi equivalenti.

#### Opzione A — SignalR

Dopo aver stabilito la connessione all'hub, invoca il metodo `GetGameState` passando il `roomId`:

```typescript
const state: InitialGameState = await connection.invoke('GetGameState', roomId);
```

- **Invia:** `roomId` (stringa GUID, es. `"27ca04a3-7f8e-42ab-bb0d-1bb1300ef079"`)
- **Riceve:** oggetto `InitialGameState` oppure `null` se la room non esiste o il roomId non è valido

#### Opzione B — REST API

```
GET https://boardgamevision.com/core/api/bgv/game_state/{roomId}
```

- **Invia:** `roomId` come path parameter (GUID)
- **Riceve:** oggetto `InitialGameState` con status `200`, oppure `400` se il roomId non è un GUID valido, `404` se la room non esiste

Esempio:

```typescript
const resp = await fetch(
  `https://boardgamevision.com/core/api/bgv/game_state/${roomId}`
);
const state: InitialGameState = await resp.json();
```

#### Opzione C — SocketIO

Dopo la connessione, emetti l'evento `GetGameState` passando un oggetto con `roomId` e una callback che riceverà la risposta:

```typescript
socket.emit('GetGameState', { roomId }, (state: InitialGameState | null) => {
  if (state) {
    // usa lo stato iniziale
  }
});
```

- **Invia:** oggetto `{ roomId: string }` (il `roomId` deve essere un GUID valido)
- **Riceve:** oggetto `InitialGameState` come argomento della callback, oppure `null` in caso di errore


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

I campi `added`, `removed`, `moved` e `rotated` indicano le differenze con lo stato precedente e sono presenti solo quando il relativo evento si e' verificato.

### Tipi di supporto

**ZoneState** - Rappresenta una zona del tavolo con le sue carte:

```typescript
interface ZoneState {
  zone: string;  // id della zona
  label: string; // Nome della zona (es. "difesa", "centro", "attacco")
  cards: Card[]; // Carte presenti in questa zona
}
```

**Card** - Una singola carta identificata dal suo marker:

```typescript
interface Card {
  id: number;  // ID del marker ArUco (identifica il tipo di carta)
  r: number;   // Rotazione in gradi (0, 90, 180, 270)
  x: number;     // normalized 0-1 horizontal position (card center) within the zone
  y: number;     // normalized 0-1 vertical position (card center) within the zone
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
      "zone": "16ccd2bc-9680-4ed2-b7f8-7ea62d69ad80",
      "label": "difesa",
      "cards": []
    },
    {
      "zone": "27ca04a3-7f8e-42ab-bb0d-1bb1300ef079",
      "label": "centro",
      "cards": [
        {
          "id": 1,
          "r": 0
        },
        {
          "id": 0,
          "r": 0
        }
      ]
    },
    {
      "zone": "5031983e-e395-44f7-beda-decfd50bbb12",
      "label": "attacco",
      "cards": []
    }
  ],
  "p2": [
    {
      "zone": "16ccd2bc-9680-4ed2-b7f8-7ea62d69ad80",
      "label": "difesa",
      "cards": []
    },
    {
      "zone": "27ca04a3-7f8e-42ab-bb0d-1bb1300ef079",
      "label": "centro",
      "cards": []
    },
    {
      "zone": "5031983e-e395-44f7-beda-decfd50bbb12",
      "label": "attacco",
      "cards": []
    }
  ],
  "added": [],
  "removed": [],
  "moved": [
    {
      "fromPlayer": 1,
      "fromZone": "5031983e-e395-44f7-beda-decfd50bbb12",
      "toPlayer": 1,
      "toZone": "27ca04a3-7f8e-42ab-bb0d-1bb1300ef079",
      "cardId": 0,
      "rotation": 0
    }
  ],
  "rotated": []
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
