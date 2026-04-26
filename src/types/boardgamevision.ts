import { CanvasImage, Zone } from "./whiteboard";

// Card placed on a rectangle
export interface Card {
  id: number;    // ArUco marker ID
  r: number;     // rotation (0, 90, 180, 270)
}

export interface CardAdded {
  player: 1 | 2;
  zone: string;
  card: Card;
}

export interface CardRemoved {
  player: 1 | 2;
  zone: string;
  cardId: number;
}

export interface CardMoved {
  fromPlayer: 1 | 2;
  fromZone: string;
  toPlayer: 1 | 2;
  toZone: string;
  cardId: number;
  rotation: number;
}

export interface CardRotated {
  player: 1 | 2;
  zone: string;
  cardId: number;
  fromRotation: number;
  toRotation: number;
}

// Rectangle with placed cards
export interface ZoneState {
  zone: string; // Rect.label
  cards: Card[];
}

// Full game state for both players
export interface GameState {
  p1: ZoneState[];
  p2: ZoneState[];
  added?: CardAdded[];
  removed?: CardRemoved[];
  moved?: CardMoved[];
  rotated?: CardRotated[];
}

export interface InitialGameState {
  nn1: string;
  nn2: string;
  p1: ZoneState[];
  p2: ZoneState[];
}


export interface GameProject {
  id: string; // RepositoryGUID
  zones: Zone[]; // M1
  boardImage: CanvasImage; // M2
  realtimeTransport: string; // T[3] -> SocketIO, SignalR
  title: string; // Title
  gameImage: string; // Thumb
  playersPosition: string; // T[2]
  webAppUrl: string; // T[0]
  exeName: string; // T[1]
}
export interface GetProjectsResp
{
    error: string;
    projects: GameProject[];
}
export interface ProjectReq
{
    myToken: string;
    project: GameProject;
}