const canvas = document.querySelector("canvas")!;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const c = canvas.getContext("2d")!;

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

class Ball {
  x: number;
  y: number;
  radius: number;
  color: string;

  vx: number = 0;
  vy: number = 0;

  ax: number = 0;
  ay: number = 9.8 / 60;

  grabbed: boolean = false;
  grabbedx: number = 0;
  grabbedy: number = 0;

  constructor(x: number, y: number, radius: number, color: string) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw(): void {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    c.fillStyle = this.color;
    c.fill();
    c.lineWidth = this.radius / 10;
    c.strokeStyle = "white";
    c.stroke();
  }

  update(): void {
    if (this.grabbed) {
      if (mouse.x > 0 && mouse.x < canvas.width) {
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
      this.gravity();
    }
  }

  private edges(): void {
    //make edegs bounce  with some softening
  }

  private gravity(): void {
    if (this.y < canvas.height - this.radius) {
      this.vy = this.vy + this.ay;
      this.y = this.y + this.vy;
    }
  }
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

    if (dist < balls[i].radius && dist < minDist) {
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

let radius = canvas.height / 20;
const ball1 = new Ball(100, 100, radius, "Black");
const ball2 = new Ball(300, 100, radius, "Black");
const ball3 = new Ball(500, 100, radius, "Black");
balls.push(ball1);
balls.push(ball2);
balls.push(ball3);

document.getElementById("add")!.onclick = function () {
  if (balls.length < 10) {
    balls.push(new Ball(500, 100, radius, "Black"));
  }
};

document.getElementById("delete")!.onclick = function () {
  if (balls.length !== 0) {
    balls.pop();
  }
};

const deleteButton = document.querySelector("canvas")!;

function main(): void {
  requestAnimationFrame(main);
  c.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < balls.length; i++) {
    balls[i].update();
    balls[i].draw();
  }
}

main();
