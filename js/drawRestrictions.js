

const thermoColor = '#aaa';


export class Thermo {
  constructor(cells) {
    this.cells = cells;
  }

  draw(draw, locations) {
    const circle = draw.circle(30).attr({cx: locations[0].x, cy: locations[0].y, fill: thermoColor});
    for (let i=1; i< this.cells.length; ++i) {
      const line = draw.line(locations[i-1].x, locations[i-1].y, locations[i].x, locations[i].y)
        .stroke({width: 10, color: thermoColor});
    }
    // console.log("Drew line", line);
    return null;
  }
}
