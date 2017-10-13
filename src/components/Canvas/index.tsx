import * as React from "react";
import {
  Wrapper,
} from "./style";

const MAX_SPEED = 7;
class Vars {
  constructor() {
    this.canvas;
    this.ctx;
    this.width;
    this.height;
    this.boids = [];
  }
}
const vars = new Vars();

const r = 5;

const get_distance = window.Module.cwrap('get_distance', 'float', []);
const getDistance = (x1, y1, x2, y2) => {
  // return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  return get_distance(x1, y1, x2, y2);
};

const get_concentration = window.Module.cwrap('get_concentration', 'float', []);
const c = 10; // 調整必要かも?
const ts = r;
const te = 40;
const clim = 3;
const getConcentration = (tm) => {
  // return (c / ((ts - te) ** 2)) * ((tm - te) ** 2);
  return get_concentration(tm, c, ts, te);
};

const get_flg = window.Module.cwrap('get_flg', 'string', ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']);

const initStage = () => {
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");
  const width = document.getElementById("wrapper").clientWidth;
  const height = document.getElementById("wrapper").clientHeight;

  vars.canvas = canvas;
  vars.ctx = ctx;
  vars.width = width;
  vars.height = height;

  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);

  Array.from(" ".repeat(12)).map((_, i) => {
    vars.boids.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      id: i,
    });
  });
};

const renderStage = () => {
  const {ctx, width, height, boids} = vars;
  ctx.clearRect(0, 0, width, height);

  // boids.forEach((b) => {
  //   ctx.beginPath();
  //   // ctx.arc(b.x, b.y, r, 0, 360 * Math.PI / 180);
  //   ctx.stroke();
  // });

  boids.forEach((boid) => {
    // rule1
    const c = {x: 0, y:0};

    boids.forEach((b) => {
      if (b.id != boid.id) {
        c.x += b.x;
        c.y += b.y;
      }
    });

    c.x /= boids.length - 1;
    c.y /= boids.length - 1;
    boid.vx += (c.x - boid.x) / 100;
    boid.vy += (c.y - boid.y) / 100;

    // rule2
    boids.forEach((b) => {
      if (b.id !== boid.id) {
        const d = getDistance(b.x, b.y, boid.x, boid.y);

        if (d < 40) {
          boid.vx -= b.x - boid.x;
          boid.vy -= b.y - boid.y;
        }
      }
    });

    // rule3
    const pv = {x: 0, y: 0};

    boids.forEach((b) => {
      if (b.id !== boid.id) {
        pv.x += b.vx;
        pv.y += b.vy;
      }
    });
    pv.x /= boids.length - 1;
    pv.y /= boids.length - 1;
    boid.vx += (pv.x - boid.vx) / 8;
    boid.vy += (pv.y - boid.vy) / 8;

    // limit speed
    const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);

    if (speed >= MAX_SPEED) {
        const r = MAX_SPEED / speed;

        boid.vx *= r;
        boid.vy *= r;
    }

    // check wall
    if (boid.x < 0 && boid.vx < 0 || boid.x > width && boid.vx > 0) boid.vx *= -1;
    if (boid.y < 0 && boid.vy < 0 || boid.y > height && boid.vy > 0) boid.vy *= -1;

    // update position
    boid.x += boid.vx;
    boid.y += boid.vy;
  });


  var len = boids.length * 2;
  var bufsize = len * 4;
  var bufptr = Module._malloc(bufsize);
  Module._memset(bufptr, 0, bufsize);
  var buf = new Float32Array(Module.HEAPF32.buffer, bufptr, len);
  for (var i = 0; i < len;i += 2){
    buf[i] = boids[i/2].x;
    buf[i+1] = boids[i/2].y;
  }

  const drawByConcentration = (boids, x1, y1, cellSize) => {
    // const flg = get_flg(len, buf.byteOffset, x1, y1, cellSize, c, ts, te, clim);

    // =========== get flg by js =============
    const x2 = x1 + cellSize;
    const y2 = y1 + cellSize;

    const vertexes = [
      [x1, y1], [x2, y1],
      [x1, y2], [x2, y2],
    ];

    const vc = vertexes.map((v) => {
      const [x, y] = v;

      let sum = 0;
      boids.forEach((boid) => {
        const d = getDistance(boid.x, boid.y, x, y);
        const c = getConcentration(d);

        if (d <= te) {
          sum += c;
        }
      });

      return sum;
    });

    const flg = vc.map((c) => {
      return c >= clim ? "1" : "0";
    }).join("");
    // ========================
    if (flg === "1111" || flg === "0000") {
      return;
    }

    const [
      c1, c2,
      c3, c4,
    ] = vc;

    // ctx.strokeStyle = "#fff";

    // holizontal
    if (flg === "1100" || flg === "0011") {
      const y3 = y2 * (Math.abs(c1 - clim) / Math.abs(c1 - c3)) + y1 * (Math.abs(c3 - clim) / Math.abs(c1 - c3));
      const y4 = y2 * (Math.abs(c2 - clim) / Math.abs(c2 - c4)) + y1 * (Math.abs(c4 - clim) / Math.abs(c2 - c4));
      
      ctx.beginPath();
      ctx.moveTo(x1, y3);
      ctx.lineTo(x2, y4);
      ctx.stroke();
      ctx.closePath();
    }
    // vertical
    if (flg === "1010" || flg === "0101") {
      const x3 = x2 * (Math.abs(c1 - clim) / Math.abs(c1 - c2)) + x1 * (Math.abs(c2 - clim) / Math.abs(c1 - c2));
      const x4 = x2 * (Math.abs(c3 - clim) / Math.abs(c3 - c4)) + x1 * (Math.abs(c4 - clim) / Math.abs(c3 - c4));

      ctx.beginPath();
      ctx.moveTo(x3, y1);
      ctx.lineTo(x4, y2);
      ctx.stroke();
      ctx.closePath();
    }
    // left top
    if (flg === "1000" || flg === "0111" || flg === "1001") {
      const x3 = x2 * (Math.abs(c1 - clim) / Math.abs(c1 - c2)) + x1 * (Math.abs(c2 - clim) / Math.abs(c1 - c2));
      const y3 = y2 * (Math.abs(c1 - clim) / Math.abs(c1 - c3)) + y1 * (Math.abs(c3 - clim) / Math.abs(c1 - c3));

      ctx.beginPath();
      ctx.moveTo(x3, y1);
      ctx.lineTo(x1, y3);
      ctx.stroke();
      ctx.closePath();
    }
    // right top
    if (flg === "0100" || flg === "1011" || flg === "0110") {
      const x3 = x1 * (Math.abs(c2 - clim) / Math.abs(c2 - c1)) + x2 * (Math.abs(c1 - clim) / Math.abs(c2 - c1));
      const y3 = y2 * (Math.abs(c2 - clim) / Math.abs(c2 - c4)) + y1 * (Math.abs(c4 - clim) / Math.abs(c2 - c4));

      ctx.beginPath();
      ctx.moveTo(x3, y1);
      ctx.lineTo(x2, y3);
      ctx.stroke();
      ctx.closePath();
    }
    // left bottom
    if (flg === "1101" || flg === "0010" || flg === "0110") {
      const x3 = x2 * (Math.abs(c3 - clim) / Math.abs(c3 - c4)) + x1 * (Math.abs(c4 - clim) / Math.abs(c3 - c4));
      const y3 = y1 * (Math.abs(c3 - clim) / Math.abs(c3 - c1)) + y2 * (Math.abs(c1 - clim) / Math.abs(c3 - c1));

      ctx.beginPath();
      ctx.moveTo(x3, y2);
      ctx.lineTo(x1, y3);
      ctx.stroke();
      ctx.closePath();
    }
    // right bottom
    if (flg === "0001" || flg === "1110" || flg === "1001") {
      const x3 = x1 * (Math.abs(c4 - clim) / Math.abs(c4 - c3)) + x2 * (Math.abs(c3 - clim) / Math.abs(c4 - c3));
      const y3 = y1 * (Math.abs(c4 - clim) / Math.abs(c4 - c2)) + y2 * (Math.abs(c2 - clim) / Math.abs(c4 - c2));

      ctx.beginPath();
      ctx.moveTo(x3, y2);
      ctx.lineTo(x2, y3);
      ctx.stroke();
      ctx.closePath();
    }
  };

  const xmin = boids.reduce((b1, b2) => ({x: Math.min(b1.x, b2.x)}), {x: width}).x - te;
  const ymin = boids.reduce((b1, b2) => ({y: Math.min(b1.y, b2.y)}), {y: height}).y - te;
  const xlim = boids.reduce((b1, b2) => ({x: Math.max(b1.x, b2.x)}), {x: 0}).x + te;
  const ylim = boids.reduce((b1, b2) => ({y: Math.max(b1.y, b2.y)}), {y: 0}).y + te;
  const division = 8;

  console.time("draw")
  for (let x = xmin; x <= xlim; x += division) {
    for (let y = ymin; y <= ylim; y += division) {
      drawByConcentration(boids, x, y, division);
    }
  }
  console.timeEnd("draw")
  Module._free(bufptr); 
  
  // requestAnimationFrame(renderStage);
};

export default class Canvas extends React.Component<{}, {}> {
  componentDidMount() {
    // this.initDatGUI();

    initStage();
    renderStage();
  }

  initDatGUI() {
    const gui = new dat.GUI();
  }

  render() {
    return (
      <Wrapper id="wrapper" className="wrapper">
        <canvas id="stage" className="stage" style={{display: "none"}} />
      </Wrapper>
    );
  }
}