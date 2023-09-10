import {PentominoSolver} from "./pentomino";




function onStep(e) {
  postMessage(e);
}


onmessage = (e) => {
  console.log("Worker received", e.data);
  const solver = new PentominoSolver(e.data, onStep);
  solver.search();
};
