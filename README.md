# Boardgame Vision - Demo React

> [Leggi in italiano](README_it.md)

This React application demonstrates how to integrate the **Boardgame Vision** platform into your game.

Boardgame Vision uses computer vision to detect physical cards on the table (via ArUco markers) and sends a **GameState** object to your game in real time whenever a card is added, removed, moved, or rotated.

## Contact & custom features

Do you have a game in mind and need features not currently available in Boardgame Vision?
Want to use custom dice, miniatures, a single board instead of 2, etc.?

Write directly to robi@robisoft.it — we'd be happy to develop together the features you need.

## How it works

```
Physical table with cards (ArUco markers)
         |
         v
  Boardgame Vision (computer vision)
         |
         v
  WebSocket server (SignalR or SocketIO)
         |
         v
  Game app (receives GameState)
```

1. The camera captures the game table
2. Boardgame Vision recognizes cards via the ArUco markers printed on each card
3. The system determines which zone each card is in and its rotation
4. On every change, the server sends a `game-state` event containing the new full game state and, for convenience, the differences from the previous state

## GameState structure

### Initial connection: `InitialGameState`

On connection, the client requests the initial state. The response contains:

```typescript
interface InitialGameState {
  nn1: string;       // Player 1 name
  nn2: string;       // Player 2 name
  p1: ZoneState[];   // Player 1 zones
  p2: ZoneState[];   // Player 2 zones
}
```

The initial state can be requested in three equivalent ways.

#### Option A — SignalR

After establishing the connection to the hub, invoke the `GetGameState` method passing the `roomId`:

```typescript
const state: InitialGameState = await connection.invoke('GetGameState', roomId);
```

- **Sends:** `roomId` (GUID string, e.g. `"27ca04a3-7f8e-42ab-bb0d-1bb1300ef079"`)
- **Receives:** an `InitialGameState` object, or `null` if the room does not exist or the roomId is invalid

#### Option B — REST API

```
GET https://boardgamevision.com/core/api/bgv/game_state/{roomId}
```

- **Sends:** `roomId` as a path parameter (GUID)
- **Receives:** an `InitialGameState` object with status `200`, or `400` if the roomId is not a valid GUID, `404` if the room does not exist

Example:

```typescript
const resp = await fetch(
  `https://boardgamevision.com/core/api/bgv/game_state/${roomId}`
);
const state: InitialGameState = await resp.json();
```

#### Option C — SocketIO

After connecting, emit the `GetGameState` event passing an object with `roomId` and a callback that will receive the response:

```typescript
socket.emit('GetGameState', { roomId }, (state: InitialGameState | null) => {
  if (state) {
    // use the initial state
  }
});
```

- **Sends:** object `{ roomId: string }` (the `roomId` must be a valid GUID)
- **Receives:** an `InitialGameState` object as the callback argument, or `null` on error


### Real-time updates: `GameState`

On every table change, the server sends a `GameState` object:

```typescript
interface GameState {
  p1: ZoneState[];        // Full state of player 1 zones
  p2: ZoneState[];        // Full state of player 2 zones
  added?: CardAdded[];    // Cards just added
  removed?: CardRemoved[];// Cards just removed
  moved?: CardMoved[];    // Cards just moved between zones
  rotated?: CardRotated[];// Cards just rotated
}
```

The `added`, `removed`, `moved`, and `rotated` fields represent the differences from the previous state and are only present when the corresponding event has occurred.

### Support types

**ZoneState** - Represents a zone on the table with its cards:

```typescript
interface ZoneState {
  zone: string;  // Zone id
  label: string; // Zone name (e.g. "defense", "center", "attack")
  cards: Card[]; // Cards present in this zone
}
```

**Card** - A single card identified by its marker:

```typescript
interface Card {
  id: number;  // ArUco marker ID (identifies the card type)
  r: number;   // Rotation in degrees (0, 90, 180, 270)
}
```

### Change events

**CardAdded** - A card has been placed on the table:

```typescript
interface CardAdded {
  player: 1 | 2;   // Player who owns the zone
  zone: string;     // Zone name
  card: Card;       // The added card (id + rotation)
}
```

**CardRemoved** - A card has been removed from the table:

```typescript
interface CardRemoved {
  player: 1 | 2;   // Player who owns the zone
  zone: string;     // Zone name
  cardId: number;   // ID of the removed card
}
```

**CardMoved** - A card has been moved from one zone to another:

```typescript
interface CardMoved {
  fromPlayer: 1 | 2;   // Source player
  fromZone: string;     // Source zone
  toPlayer: 1 | 2;     // Destination player
  toZone: string;       // Destination zone
  cardId: number;       // Card ID
  rotation: number;     // Rotation in the new position
}
```

**CardRotated** - A card has been rotated in place:

```typescript
interface CardRotated {
  player: 1 | 2;       // Player
  zone: string;         // Zone
  cardId: number;       // Card ID
  fromRotation: number; // Previous rotation
  toRotation: number;   // New rotation
}
```

## GameState example

```json
{
  "p1": [
    {
      "zone": "16ccd2bc-9680-4ed2-b7f8-7ea62d69ad80",
      "label": "defense",
      "cards": []
    },
    {
      "zone": "27ca04a3-7f8e-42ab-bb0d-1bb1300ef079",
      "label": "center",
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
      "label": "attack",
      "cards": []
    }
  ],
  "p2": [
    {
      "zone": "16ccd2bc-9680-4ed2-b7f8-7ea62d69ad80",
      "label": "defense",
      "cards": []
    },
    {
      "zone": "27ca04a3-7f8e-42ab-bb0d-1bb1300ef079",
      "label": "center",
      "cards": []
    },
    {
      "zone": "5031983e-e395-44f7-beda-decfd50bbb12",
      "label": "attack",
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

## Server connection

The app supports two transport protocols: **SignalR** and **SocketIO**.

### Required URL parameters

The app expects two query parameters in the URL:

| Parameter   | Description                   | Allowed values         |
|-------------|-------------------------------|------------------------|
| `roomId`    | Game room identifier          | Any string             |
| `transport` | Connection protocol           | `signalr` or `socketio`|

Example: `https://boardgamevision.com/demo-react/?roomId=room-42&transport=signalr`

### SignalR

- Endpoint: `https://boardgamevision.com/core/gameHub?roomId={roomId}`
- Initial state: `connection.invoke('GetGameState', roomId)` -> returns `InitialGameState`
- Updates: `game-state` event -> receives `GameState`

### SocketIO

- Endpoint: `https://boardgamevision.com` with path `/gameSocket`
- Query parameter: `roomId`
- Initial state: `socket.emit('GetGameState', roomId, callback)` -> callback receives `InitialGameState`
- Updates: `game-state` event -> receives `GameState`

## Running the project locally

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173/demo-react/`.

## Technologies used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- @microsoft/signalr
- socket.io-client
