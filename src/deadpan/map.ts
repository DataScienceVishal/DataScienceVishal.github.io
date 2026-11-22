/**
 * The island as deadpan's data/maps/island.json draws it, with the layout the
 * live-game design gives. Only a picture to open the page on before anyone
 * presses Watch: the map that counts arrives with each game's `game` event.
 */
import type { MapInfo } from "./types";

export const ISLAND: MapInfo = {
  name: "rock-light",
  start: "Cottage",
  rooms: {
    Cottage: ["Kitchen", "Stairwell", "Yard"],
    Kitchen: ["Cottage", "Oil Store"],
    "Oil Store": ["Kitchen", "Stairwell"],
    Stairwell: ["Cottage", "Oil Store", "Lamp Room"],
    "Lamp Room": ["Stairwell"],
    Yard: ["Cottage", "Workshop", "Boathouse"],
    Workshop: ["Yard", "Boathouse"],
    Boathouse: ["Yard", "Workshop", "Jetty"],
    Jetty: ["Boathouse"],
  },
  layout: {
    "Lamp Room": [2, 0],
    Stairwell: [2, 1],
    "Oil Store": [1, 1],
    Kitchen: [1, 2],
    Cottage: [2, 2],
    Yard: [2, 3],
    Workshop: [3, 3],
    Boathouse: [2, 4],
    Jetty: [1, 4],
  },
};
