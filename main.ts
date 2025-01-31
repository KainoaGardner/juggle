const canvas = document.querySelector("canvas")!;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;

const c = canvas.getContext("2d")!;

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 100;
});

class Ball {
  x: number;
  y: number;
  radius: number;
  color: string;
  strokeColor: string;

  vx: number = 500;
  vy: number = 0;

  ax: number = 0;
  ay: number = 3000;

  grabbed: boolean = false;
  grabbedx: number = 0;
  grabbedy: number = 0;

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    strokeColor: string,
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.strokeColor = strokeColor;
  }

  draw(): void {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    c.fillStyle = this.color;
    c.fill();
    c.lineWidth = this.radius / 10;
    c.strokeStyle = this.strokeColor;
    c.stroke();
  }

  update(): void {
    if (this.grabbed) {
      if (mouse.x > 0 && mouse.x < canvas.width && mouse.y < canvas.height) {
        this.x = mouse.x;
        this.y = mouse.y;
        this.vy = 0;
        this.vx = 0;
        this.grabbedx = mouse.x;
        this.grabbedy = mouse.y;
      } else {
        this.grabbed = false;
      }
    } else {
      this.movement();
      this.edges();
    }
  }

  private edges(): void {
    const loss = 0.8;
    const friction = 0.8;

    //left
    if (this.x - this.radius <= 0) {
      this.x = this.radius;
      this.vx = this.vx * -1 * loss;
    }
    //right
    if (this.x + this.radius >= canvas.width) {
      this.x = canvas.width - this.radius;
      this.vx = this.vx * -1 * loss;
    }

    //bottom
    if (this.y + this.radius >= canvas.height) {
      this.y = canvas.height - this.radius;
      this.vy = this.vy * -1 * loss;
    }

    if (this.y === canvas.height - this.radius) {
      this.vx = this.vx * friction;
    }
  }

  private movement(): void {
    //set new velocity
    this.vx = this.vx + this.ax * dt;
    this.vy = this.vy + this.ay * dt;

    //set new position
    this.x = this.x + this.vx * dt;
    this.y = this.y + this.vy * dt;
  }
}

function ballCollision(): void {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const dist = Math.sqrt(
        Math.pow(balls[i].x - balls[j].x, 2) +
          Math.pow(balls[i].y - balls[j].y, 2),
      );

      if (dist <= balls[i].radius + balls[j].radius) {
        ballResponse(balls[i], balls[j], dist);
      }
    }
  }
}

function ballResponse(b1: any, b2: any, dist: number): void {
  const offDist = b1.radius + b2.radius - dist;
  const dx = b1.x - b2.x;
  const dy = b1.y - b2.y;

  const h = offDist / 1.5;

  const angle = Math.atan2(dy, dx);

  const moveX = h * Math.cos(angle);
  const moveY = h * Math.sin(angle);

  b1.x = b1.x + moveX;
  b1.y = b1.y + moveY;

  b2.x = b2.x - moveX;
  b2.y = b2.y - moveY;

  let newVX1: number;
  let newVY1: number;
  let newVX2: number;
  let newVY2: number;

  if (b2.x - b1.x === 0) {
    newVX1 = b1.vx * -1;
  } else {
    newVX1 =
      b1.vx +
      (((b2.vx - b1.vx) * (b2.x - b1.x)) / Math.pow(b2.x - b1.x, 2)) *
        (b2.x - b1.x);
  }

  if (b2.y - b1.y === 0) {
    newVY1 = b1.vy * -1;
  } else {
    newVY1 =
      b1.vy +
      (((b2.vy - b1.vy) * (b2.y - b1.y)) / Math.pow(b2.y - b1.y, 2)) *
        (b2.y - b1.y);
  }

  if (b1.x - b2.x === 0) {
    newVX2 = b2.vx * -1;
  } else {
    newVX2 =
      b2.vx +
      (((b1.vx - b2.vx) * (b1.x - b2.x)) / Math.pow(b1.x - b2.x, 2)) *
        (b1.x - b2.x);
  }

  if (b1.y - b2.y === 0) {
    newVY2 = b2.vy * -1;
  } else {
    newVY2 =
      b2.vy +
      (((b1.vy - b2.vy) * (b1.y - b2.y)) / Math.pow(b1.y - b2.y, 2)) *
        (b1.y - b2.y);
  }

  const loss = 0.8;

  b1.vx = newVX1 * loss;
  b1.vy = newVY1 * loss;
  b2.vx = newVX2 * loss;
  b2.vy = newVY2 * loss;
}

const mouse = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", function (event) {
  const rect = canvas.getBoundingClientRect();

  mouse.x =
    ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
  mouse.y =
    ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;
});

window.addEventListener("mousedown", function (event) {
  const rect = canvas.getBoundingClientRect();

  mouse.x =
    ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
  mouse.y =
    ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;

  let grabbable: Ball[] = [];
  let minDist = Infinity;
  for (let i = 0; i < balls.length; i++) {
    if (!mouse.x || !mouse.y) {
      break;
    }
    const dist = Math.sqrt(
      Math.pow(mouse.x - balls[i].x, 2) + Math.pow(mouse.y - balls[i].y, 2),
    );

    if (dist - balls[i].radius * 2 < balls[i].radius && dist < minDist) {
      grabbable.push(balls[i]);
      minDist = dist;
    }
  }

  if (grabbable.length !== 0) {
    grabbable[grabbable.length - 1].grabbed = true;
  }
});

window.addEventListener("mouseup", function (event) {
  for (let i = 0; i < balls.length; i++) {
    if (balls[i].grabbed) {
      const dist = Math.sqrt(
        Math.pow(mouse.x - balls[i].x, 2) + Math.pow(mouse.y - balls[i].y, 2),
      );

      balls[i].grabbed = false;
    }
  }
});

let balls: Ball[] = [];

let radius = 50;
const ball1 = new Ball(100, 100, radius, "Black", "white");
const ball2 = new Ball(300, 100, radius, "Black", "white");
const ball3 = new Ball(500, 100, radius, "Black", "white");
balls.push(ball1);
balls.push(ball2);
balls.push(ball3);

document.getElementById("add")!.onclick = function () {
  if (balls.length < 10) {
    balls.push(new Ball(500, 100, radius, ballColor.value, strokeColor.value));
  }
};

document.getElementById("delete")!.onclick = function () {
  if (balls.length !== 0) {
    balls.pop();
  }
};

const backgroundColor = document.getElementById(
  "backgroundColor",
) as HTMLInputElement;
backgroundColor.value = "#bdc3c7";
backgroundColor.addEventListener("change", (event) => {
  canvas.style.backgroundColor = backgroundColor.value;
});

const ballColor = document.getElementById("ballColor") as HTMLInputElement;
ballColor.value = "black";
ballColor.addEventListener("change", (event) => {
  for (let i = 0; i < balls.length; i++) {
    balls[i].color = ballColor.value;
  }
});

const strokeColor = document.getElementById("strokeColor") as HTMLInputElement;
strokeColor.value = "#ffffff";
strokeColor.addEventListener("change", (event) => {
  for (let i = 0; i < balls.length; i++) {
    balls[i].strokeColor = strokeColor.value;
  }
});

const ballRadius = document.getElementById("radius") as HTMLInputElement;
ballRadius.value = "50";
ballRadius.addEventListener("change", (event) => {
  for (let i = 0; i < balls.length; i++) {
    balls[i].radius = +ballRadius.value;
  }
});

function main(): void {
  setInterval(updateFrame, 1000 / targetFps);
  drawFrame();
}

function drawFrame(): void {
  requestAnimationFrame(drawFrame);
  c.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < balls.length; i++) {
    balls[i].draw();
  }
}

function updateFrame(): void {
  showFps();
  for (let i = 0; i < balls.length; i++) {
    balls[i].update();
  }

  ballCollision();
}

let times: number[] = [];
function showFps(): void {
  const now: number = performance.now();
  while (times.length > 0 && times[0] <= now - 1000) {
    times.shift();
  }
  times.push(now);
  const fps: number = times.length;
  // console.log(fps);
}

const targetFps: number = 60;
const dt: number = 1 / targetFps;
main();
