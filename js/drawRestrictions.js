

const thermoColor = '#444';


export class Thermo {
  constructor(cells) {
    this.cells = cells;
  }

  draw(draw, locations, rects) {
    const svg = draw.nested();
    // const circle = svg.circle(30).attr({cx: locations[this.cells[0]].x, cy: locations[this.cells[0]].y,
    //   fill: thermoColor});
    for (let i=1; i< this.cells.length; ++i) {
      const line = svg.line(locations[this.cells[i-1]].x, locations[this.cells[i-1]].y,
        locations[this.cells[i]].x, locations[this.cells[i]].y)
        .stroke({width: 5, color: thermoColor});
    }
  }
}
