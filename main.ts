const canvas = document.querySelector("canvas")!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;

const c = canvas.getContext("2d")!;
c.textBaseline = "middle";
c.textAlign = "center";

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

  vx: number = 0;
  vy: number = 0;

  ax: number = 0;
  ay: number = (9.8 * 1000) / 2;

  hitAudio = new Audio("static/hit.wav");

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
    const totalV = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    this.hitAudio.volume = Math.min(totalV, 3000) / 3000;

    //left
    if (this.x - this.radius <= 0) {
      this.x = this.radius;
      this.vx = this.vx * -1 * loss;

      if (totalV > 500) {
        this.hitAudio.play();
      }
    }
    //right
    if (this.x + this.radius >= canvas.width) {
      this.x = canvas.width - this.radius;
      this.vx = this.vx * -1 * loss;
      if (totalV > 500) {
        this.hitAudio.play();
      }
    }

    //bottom
    if (this.y + this.radius >= canvas.height) {
      this.y = canvas.height - this.radius;
      this.vy = this.vy * -1 * loss;
      if (totalV > 500) {
        this.hitAudio.play();
      }
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
  let dx = b1.x - b2.x;
  let dy = b1.y - b2.y;

  const h = offDist / 1.5;

  let angle = Math.atan2(dy, dx);

  const moveX = h * Math.cos(angle);
  const moveY = h * Math.sin(angle);

  b1.x = b1.x + moveX;
  b1.y = b1.y + moveY;

  b2.x = b2.x - moveX;
  b2.y = b2.y - moveY;

  //velocity math

  dist = Math.sqrt(Math.pow(b1.x - b2.x, 2) + Math.pow(b1.y - b2.y, 2));

  let VX1;
  let VY1;
  let VX2;
  let VY2;

  let k =
    ((b1.vx - b2.vx) * (b1.x - b2.x) + (b1.vy - b2.vy) * (b1.y - b2.y)) /
    (dist * dist);

  VX1 = b1.vx - k * (b1.x - b2.x);
  VY1 = b1.vy - k * (b1.y - b2.y);

  k =
    ((b2.vx - b1.vx) * (b2.x - b1.x) + (b2.vy - b1.vy) * (b2.y - b1.y)) /
    (dist * dist);

  VX2 = b2.vx - k * (b2.x - b1.x);
  VY2 = b2.vy - k * (b2.y - b1.y);

  const loss = 0.8;
  b1.vx = VX1 * loss;
  b1.vy = VY1 * loss;
  b2.vx = VX2 * loss;
  b2.vy = VY2 * loss;

  const totalV =
    Math.sqrt(b1.vx * b1.vx + b1.vy * b1.vy) +
    Math.sqrt(b2.vx * b2.vx + b2.vy * b2.vy);

  if (totalV > 500) {
    b1.hitAudio.volume = Math.min(totalV, 5000) / 5000;
    b1.hitAudio.play();
  }
}

let score = 0;
function checkJuggling(): boolean {
  if (balls.length == 0) {
    return false;
  }

  for (let i = 0; i < balls.length; i++) {
    if (balls[i].y === canvas.height - balls[i].radius) {
      return false;
    }
  }
  return true;
}

function juggleScore(): void {
  if (checkJuggling()) {
    score++;
  } else {
    score = 0;
  }
}

let scoreFill: string = "white";
function drawText(): void {
  c.font = "300px Trebuchet MS ";
  c.fillStyle = scoreFill;

  const text = `${Math.floor(score / 60)}`;
  c.fillText(text, canvas.width / 2, canvas.height / 2);
}

const mouse = {
  x: 0,
  y: 0,
};

let mousePos: number[][] = [];

window.addEventListener("mousemove", function (event) {
  const rect = canvas.getBoundingClientRect();

  mouse.x =
    ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
  mouse.y =
    ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;

  mousePos.push([mouse.x, mouse.y]);
  if (mousePos.length > 5) {
    mousePos.shift();
  }
});

window.addEventListener("mousedown", function (event) {
  const rect = canvas.getBoundingClientRect();

  mouse.x =
    ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
  mouse.y =
    ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;

  mousePos = [];

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
    clickAudio.play();
  }
});

window.addEventListener("mouseup", function (event) {
  for (let i = 0; i < balls.length; i++) {
    if (balls[i].grabbed) {
      if (mousePos.length > 0) {
        const xDist = mouse.x - mousePos[0][0];
        const yDist = mouse.y - mousePos[0][1];

        balls[i].vx = xDist / dt / 5;
        balls[i].vy = yDist / dt / 5;
      }

      balls[i].grabbed = false;
    }
  }
});

let balls: Ball[] = [];

let radius = 50;
const ball1 = new Ball(
  canvas.width / 2,
  canvas.height - radius,
  radius,
  "Black",
  "white",
);
const ball2 = new Ball(
  canvas.width / 4,
  canvas.height - radius,
  radius,
  "Black",
  "white",
);
const ball3 = new Ball(
  canvas.width / 2 + canvas.width / 4,
  canvas.height - radius,
  radius,
  "Black",
  "white",
);
balls.push(ball1);
balls.push(ball2);
balls.push(ball3);

document.getElementById("add")!.onclick = function () {
  if (balls.length < 10) {
    balls.push(
      new Ball(
        canvas.width / 2,
        100,
        radius,
        ballColor.value,
        strokeColor.value,
      ),
    );
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

const scoreColor = document.getElementById("scoreColor") as HTMLInputElement;
scoreColor.value = "#ffffff";
scoreColor.addEventListener("change", (event) => {
  scoreFill = scoreColor.value;
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

const gravityButton = document.getElementById("gravity") as HTMLInputElement;
gravityButton.value = "9.8";
gravityButton.addEventListener("change", (event) => {
  for (let i = 0; i < balls.length; i++) {
    balls[i].ay = (+gravityButton.value * 1000) / 2;
  }
});

const speedDom = document.getElementById("speed") as HTMLInputElement;
speedDom.value = "1";
speedDom.addEventListener("change", (event) => {
  speed = +speedDom.value;
});

function main(): void {
  drawFrame();
}

function drawFrame(): void {
  requestAnimationFrame(drawFrame);
  c.clearRect(0, 0, canvas.width, canvas.height);
  drawText();
  for (let i = 0; i < balls.length; i++) {
    balls[i].draw();
  }
}

function updateFrame(): void {
  clearInterval(interval);
  showFps();
  for (let i = 0; i < balls.length; i++) {
    balls[i].update();
  }

  ballCollision();
  juggleScore();

  interval = setInterval(updateFrame, 1000 / (targetFps * speed));
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
let speed = 1;
const dt: number = 1 / targetFps;
const clickAudio = new Audio("static/click.wav");
// clickAudio.volume = 0.5;
const hitEdgeAudio = new Audio("static/hit.wav");

let interval = setInterval(updateFrame, 1000 / (targetFps * speed));

main();
