// noinspection ES6CheckImport
import { SVG } from '@svgdotjs/svg.js'

export function drawSudoku() {
  const draw = SVG().addTo('body').size(1200, 1200);

  for (let i=0; i<9; ++i) {
    for (let j=0; j<9; ++j) {
      let x = 20 + 90*i;
      let y = 20 + 90*j;
      const rect = draw.rect(90, 90)
        .attr({x: x, y: y, fill: '#fff', stroke: '#000', 'stroke-width': 1});
      const text = draw.text('1').attr(
        {'font-size': '60px'});
      text.center(x + 45, y + 45);
    }
  }
}
