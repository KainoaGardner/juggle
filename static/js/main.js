var canvas = document.querySelector("canvas");
canvas.width = window.innerWidth - 200;
canvas.height = window.innerHeight - 100;
var c = canvas.getContext("2d");
c.textBaseline = "middle";
c.textAlign = "center";
window.addEventListener("resize", function () {
    canvas.width = window.innerWidth - 200;
    canvas.height = window.innerHeight - 100;
    c.textBaseline = "middle";
    c.textAlign = "center";
});
var Ball = /** @class */ (function () {
    function Ball(x, y, radius, color, strokeColor) {
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = (9.8 * 1000) / 2;
        this.hitAudio = new Audio("static/hit.wav");
        this.grabbed = false;
        this.grabbedx = 0;
        this.grabbedy = 0;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.strokeColor = strokeColor;
    }
    Ball.prototype.draw = function () {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        c.fillStyle = this.color;
        c.fill();
        c.lineWidth = this.radius / 10;
        c.strokeStyle = this.strokeColor;
        c.stroke();
    };
    Ball.prototype.update = function () {
        if (this.grabbed) {
            if (mouse.x > 0 && mouse.x < canvas.width && mouse.y < canvas.height) {
                this.x = mouse.x;
                this.y = mouse.y;
                this.vy = 0;
                this.vx = 0;
                this.grabbedx = mouse.x;
                this.grabbedy = mouse.y;
            }
            else {
                this.grabbed = false;
            }
        }
        else {
            this.movement();
            this.edges();
        }
    };
    Ball.prototype.edges = function () {
        var loss = 0.8;
        var friction = 0.8;
        var totalV = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
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
    };
    Ball.prototype.movement = function () {
        //set new velocity
        this.vx = this.vx + this.ax * dt;
        this.vy = this.vy + this.ay * dt;
        //set new position
        this.x = this.x + this.vx * dt;
        this.y = this.y + this.vy * dt;
    };
    return Ball;
}());
function ballCollision() {
    for (var i = 0; i < balls.length; i++) {
        for (var j = i + 1; j < balls.length; j++) {
            var dist = Math.sqrt(Math.pow(balls[i].x - balls[j].x, 2) +
                Math.pow(balls[i].y - balls[j].y, 2));
            if (dist <= balls[i].radius + balls[j].radius) {
                ballResponse(balls[i], balls[j], dist);
            }
        }
    }
}
function ballResponse(b1, b2, dist) {
    var offDist = b1.radius + b2.radius - dist;
    var dx = b1.x - b2.x;
    var dy = b1.y - b2.y;
    var h = offDist / 1.5;
    var angle = Math.atan2(dy, dx);
    var moveX = h * Math.cos(angle);
    var moveY = h * Math.sin(angle);
    b1.x = b1.x + moveX;
    b1.y = b1.y + moveY;
    b2.x = b2.x - moveX;
    b2.y = b2.y - moveY;
    //velocity math
    dist = Math.sqrt(Math.pow(b1.x - b2.x, 2) + Math.pow(b1.y - b2.y, 2));
    var VX1;
    var VY1;
    var VX2;
    var VY2;
    var k = ((b1.vx - b2.vx) * (b1.x - b2.x) + (b1.vy - b2.vy) * (b1.y - b2.y)) /
        (dist * dist);
    VX1 = b1.vx - k * (b1.x - b2.x);
    VY1 = b1.vy - k * (b1.y - b2.y);
    k =
        ((b2.vx - b1.vx) * (b2.x - b1.x) + (b2.vy - b1.vy) * (b2.y - b1.y)) /
            (dist * dist);
    VX2 = b2.vx - k * (b2.x - b1.x);
    VY2 = b2.vy - k * (b2.y - b1.y);
    var loss = 0.8;
    b1.vx = VX1 * loss;
    b1.vy = VY1 * loss;
    b2.vx = VX2 * loss;
    b2.vy = VY2 * loss;
    var totalV = Math.sqrt(b1.vx * b1.vx + b1.vy * b1.vy) +
        Math.sqrt(b2.vx * b2.vx + b2.vy * b2.vy);
    if (totalV > 500) {
        b1.hitAudio.volume = Math.min(totalV, 5000) / 5000;
        b1.hitAudio.play();
    }
}
var score = 0;
function checkJuggling() {
    if (balls.length == 0) {
        return false;
    }
    for (var i = 0; i < balls.length; i++) {
        if (balls[i].y === canvas.height - balls[i].radius) {
            return false;
        }
    }
    return true;
}
var highScoreElement = document.getElementById("highScore");
function juggleScore() {
    if (checkJuggling()) {
        score++;
        if (Math.floor(score / 60) > highScore) {
            highScore = Math.floor(score / 60);
            highScoreElement.innerHTML = "" + highScore;
        }
    }
    else {
        score = 0;
    }
}
var scoreFill = "white";
function drawText() {
    c.font = "300px Trebuchet MS ";
    c.fillStyle = scoreFill;
    var text = "".concat(Math.floor(score / 60));
    c.fillText(text, canvas.width / 2, canvas.height / 2);
}
var mouse = {
    x: 0,
    y: 0,
};
var mousePos = [];
window.addEventListener("mousemove", function (event) {
    var rect = canvas.getBoundingClientRect();
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
    var rect = canvas.getBoundingClientRect();
    mouse.x =
        ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
    mouse.y =
        ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;
    mousePos = [];
    var grabbable = [];
    var minDist = Infinity;
    for (var i = 0; i < balls.length; i++) {
        if (!mouse.x || !mouse.y) {
            break;
        }
        var dist = Math.sqrt(Math.pow(mouse.x - balls[i].x, 2) + Math.pow(mouse.y - balls[i].y, 2));
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
    for (var i = 0; i < balls.length; i++) {
        if (balls[i].grabbed) {
            if (mousePos.length > 0) {
                var xDist = mouse.x - mousePos[0][0];
                var yDist = mouse.y - mousePos[0][1];
                balls[i].vx = xDist / dt / 5;
                balls[i].vy = yDist / dt / 5;
            }
            balls[i].grabbed = false;
        }
    }
});
var balls = [];
var radius = 50;
var ball1 = new Ball(canvas.width / 2, canvas.height - radius, radius, "Black", "white");
var ball2 = new Ball(canvas.width / 4, canvas.height - radius, radius, "Black", "white");
var ball3 = new Ball(canvas.width / 2 + canvas.width / 4, canvas.height - radius, radius, "Black", "white");
balls.push(ball1);
balls.push(ball2);
balls.push(ball3);
document.getElementById("add").onclick = function () {
    if (balls.length < 10) {
        balls.push(new Ball(canvas.width / 2, 100, radius, ballColor.value, strokeColor.value));
    }
};
document.getElementById("delete").onclick = function () {
    if (balls.length !== 0) {
        balls.pop();
    }
};
document.getElementById("reset").onclick = function () {
    console.log("reste");
    if (balls.length > 0) {
        var gap = canvas.width / (balls.length + 1);
        for (var i = 0; i < balls.length; i++) {
            balls[i].vx = 0;
            balls[i].vy = 0;
            balls[i].y = canvas.height - balls[i].radius;
            balls[i].x = (i + 1) * gap;
        }
    }
};
var backgroundColor = document.getElementById("backgroundColor");
backgroundColor.value = "#bdc3c7";
backgroundColor.addEventListener("change", function (event) {
    canvas.style.backgroundColor = backgroundColor.value;
});
var scoreColor = document.getElementById("scoreColor");
scoreColor.value = "#ffffff";
scoreColor.addEventListener("change", function (event) {
    scoreFill = scoreColor.value;
});
var ballColor = document.getElementById("ballColor");
ballColor.value = "black";
ballColor.addEventListener("change", function (event) {
    for (var i = 0; i < balls.length; i++) {
        balls[i].color = ballColor.value;
    }
});
var strokeColor = document.getElementById("strokeColor");
strokeColor.value = "#ffffff";
strokeColor.addEventListener("change", function (event) {
    for (var i = 0; i < balls.length; i++) {
        balls[i].strokeColor = strokeColor.value;
    }
});
var ballRadius = document.getElementById("radius");
ballRadius.value = "50";
ballRadius.addEventListener("change", function (event) {
    if (+ballRadius.value >= 10 && +ballRadius.value <= 100) {
        for (var i = 0; i < balls.length; i++) {
            balls[i].radius = +ballRadius.value;
        }
    }
    else {
        ballRadius.value = "" + 50;
        for (var i = 0; i < balls.length; i++) {
            balls[i].radius = +ballRadius.value;
        }
    }
});
var gravityButton = document.getElementById("gravity");
gravityButton.value = "9.8";
gravityButton.addEventListener("change", function (event) {
    if (+gravityButton >= 0 && +gravityButton <= 50) {
        for (var i = 0; i < balls.length; i++) {
            balls[i].ay = (+gravityButton.value * 1000) / 2;
        }
    }
    else {
        gravityButton.value = "" + 9.8;
        for (var i = 0; i < balls.length; i++) {
            balls[i].ay = (+gravityButton.value * 1000) / 2;
        }
    }
});
var speedDom = document.getElementById("speed");
speedDom.value = "1";
speedDom.addEventListener("change", function (event) {
    if (+speedDom.value >= 0.1 && +speedDom.value <= 3) {
        speed = +speedDom.value;
    }
    else {
        speedDom.value = "" + 1;
        speed = 1;
    }
});
function main() {
    drawFrame();
}
function drawFrame() {
    requestAnimationFrame(drawFrame);
    c.clearRect(0, 0, canvas.width, canvas.height);
    drawText();
    for (var i = 0; i < balls.length; i++) {
        balls[i].draw();
    }
}
function updateFrame() {
    clearInterval(interval);
    showFps();
    for (var i = 0; i < balls.length; i++) {
        balls[i].update();
    }
    ballCollision();
    juggleScore();
    interval = setInterval(updateFrame, 1000 / (targetFps * speed));
}
var times = [];
function showFps() {
    var now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
    }
    times.push(now);
    var fps = times.length;
    // console.log(fps);
}
var targetFps = 60;
var speed = 1;
var highScore = 0;
var dt = 1 / targetFps;
var clickAudio = new Audio("static/click.wav");
// clickAudio.volume = 0.5;
var hitEdgeAudio = new Audio("static/hit.wav");
var interval = setInterval(updateFrame, 1000 / (targetFps * speed));
main();
