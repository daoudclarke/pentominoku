// noinspection ES6CheckImport
import { SVG } from '@svgdotjs/svg.js'

export function drawSudoku() {
  const draw = SVG().addTo('body').size(1200, 1200);

  let lastRect = null;

  for (let i=0; i<9; ++i) {
    for (let j=0; j<9; ++j) {
      let x = 20 + 90*i;
      let y = 20 + 90*j;

      const square = draw.nested();
      square.attr({x: x, y: y});

      const rect = square.rect(90, 90).attr({x: 0, y: 0, fill: '#fff', stroke: '#000', 'stroke-width': 1});
      const text = square.text('1').attr(
        {'font-size': '60px'});
      text.center(45, 45);

      square.mouseover(() => rect.attr({fill: '#eee'}));
      square.mouseout(() => rect.attr({fill: '#fff'}));
      square.click(() => {
        if (lastRect !== null) {
          lastRect.removeClass('selected');
        }
        rect.addClass('selected');
        lastRect = rect;
      })

    }
  }
}
