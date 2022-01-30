const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
let defenders = [];
let numberOfResources = 300;
const enemies = [];
const enemiesPosition = [];
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
//---------------MOUSE-------------------
let mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
};

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", (e) => {
  mouse = {
    ...mouse,
    x: e.x - canvasPosition.left,
    y: e.y - canvasPosition.top,
  };
});

canvas.addEventListener("mouseleave", () => {
  mouse = {
    ...mouse,
    x: undefined,
    y: undefined,
  };
});
//-------------------MOUSE-------------------

const controlsBar = {
  width: canvas.width,
  height: cellSize,
};

//--------------GRID--------------
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
  }

  draw() {
    if (mouse.x && mouse.y && collision(this, mouse)) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

function createGrid() {
  for (let y = cellSize; y < canvas.height; y += cellSize) {
    for (let x = 0; x < canvas.width; x += cellSize) {
      gameGrid.push(new Cell(x, y));
    }
  }
}
function handleGameGrid() {
  gameGrid.forEach((grid) => {
    grid.draw();
  });
}
createGrid();
//--------------GRID-----------------------
//---------------DEFENDER------------------
class Defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
    this.shooting = false;
    this.health = 100;
    this.projectiles = [];
    this.timer = 0;
  }
  draw() {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "gold";
    ctx.font = "30px Orbitron";
    ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
  }
}

canvas.addEventListener("click", () => {
  const gridPositionX = mouse.x - (mouse.x % cellSize);
  const gridPositionY = mouse.y - (mouse.y % cellSize);
  if (gridPositionY < cellSize) return;
  if (
    defenders.some(
      (defender) => defender.x === gridPositionX && defender.y === gridPositionY
    )
  ) {
    return;
  }
  let defenderCost = 100;
  if (numberOfResources >= defenderCost) {
    defenders.push(new Defender(gridPositionX, gridPositionY));
    numberOfResources -= defenderCost;
  }
});

function handleDefenders() {
  defenders.forEach((defender, index) => {
    defender.draw();
    enemies.forEach((enemy) => {
      if (collision(defender, enemy)) {
        enemy.movement = 0;
        defender.health -= 0.2;
      }
      if (defender.health <= 0) {
        let aliveDefenders = defenders.filter(
          (defender) => defender.health > 0
        );
        defenders = aliveDefenders;
        enemy.movement = enemy.speed;
      }
    });
  });
}
//---------------DEFENDER------------------
//---------------ENEMIES-------------------
class Enemy {
  constructor(verticalPosition) {
    this.x = canvas.width;
    this.y = verticalPosition;
    this.width = cellSize;
    this.height = cellSize;
    this.speed = Math.random() * 0.2 + 0.4;
    this.movement = this.speed;
    this.health = 100;
    this.maxHealth = this.health;
  }
  update() {
    this.x -= this.movement;
  }
  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
  }
}

function handleEnemies() {
  enemies.forEach((enemy) => {
    enemy.update();
    enemy.draw();
    if (enemy.x < 0) {
      gameOver = true;
    }
  });
  if (frame % enemiesInterval === 0) {
    let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
    enemies.push(new Enemy(verticalPosition));
    enemiesPosition.push(verticalPosition);
    if (enemiesInterval > 120) enemiesInterval -= 50;
  }
}
//--------------ENEMIES-------------------
//---------------UTILITIES----------------

function handleGameStatus() {
  ctx.fillStyle = "black";
  ctx.font = "30px Orbitron";
  ctx.fillText("Resources: " + numberOfResources, 20, 55);
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "60px Orbitron";
    ctx.fillText("GAME OVER", 135, 330);
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
  handleGameGrid();
  handleDefenders();
  handleEnemies();
  handleGameStatus();
  frame++;
  if (!gameOver) requestAnimationFrame(animate);
}
animate();

function collision(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
}
