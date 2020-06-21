

const thermoColor = '#aaa';


export class Thermo {
  constructor(cells) {
    this.cells = cells;
  }

  draw(draw, locations) {
    const circle = draw.circle(30).attr({cx: locations[this.cells[0]].x, cy: locations[this.cells[0]].y,
      fill: thermoColor});
    for (let i=1; i< this.cells.length; ++i) {
      const line = draw.line(locations[this.cells[i-1]].x, locations[this.cells[i-1]].y,
        locations[this.cells[i]].x, locations[this.cells[i]].y)
        .stroke({width: 10, color: thermoColor});
    }
    // console.log("Drew line", line);
    return null;
  }
}
