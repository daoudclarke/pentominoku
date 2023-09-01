import {search} from "./pentomino";




function onStep(e) {
  postMessage(e);
}


search(onStep);
