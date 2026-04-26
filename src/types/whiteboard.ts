export interface Zone {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  col: string;
}

export interface CanvasImage {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;          // data URL
  naturalWidth: number;
  naturalHeight: number;
}

export type Tool = "select" | "rect";

export type HandlePosition =
  | "nw" | "n" | "ne"
  | "w"  |       "e"
  | "sw" | "s" | "se";

export type CornerHandle = "nw" | "ne" | "sw" | "se";
