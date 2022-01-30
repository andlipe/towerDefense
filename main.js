const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

const cellSize = 100;
const cellGap = 3;
let numberOfResources = 300;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
const winningScore = 50;
let score = 0;
const gameGrid = [];
let defenders = [];
let enemies = [];
let enemiesPosition = [];
const projectiles = [];
const resources = [];
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
    this.width = cellSize - cellGap * 2;
    this.height = cellSize - cellGap * 2;
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
  update() {
    if (this.shooting) {
      this.timer++;
      if (this.timer % 100 === 0) {
        projectiles.push(new Projectile(this.x + 70, this.y + 50));
      }
    } else {
      this.timer = 0;
    }
  }
}

canvas.addEventListener("click", () => {
  const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
  const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
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
    defender.update();
    if (enemiesPosition.indexOf(defender.y) !== -1) {
      defender.shooting = true;
    } else {
      defender.shooting = false;
    }
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
//---------------PROJECTILES---------------
class Projectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.power = 20;
    this.speed = 5;
  }
  update() {
    this.x += this.speed;
  }
  draw() {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    ctx.fill();
  }
}

function handleProjectiles() {
  projectiles.forEach((projectile, index) => {
    projectile.update();
    projectile.draw();
    enemies.forEach((enemy, enemyIndex) => {
      if (enemy && projectile && collision(projectile, enemy)) {
        enemy.health -= projectile.power;
        projectiles.splice(index, 1);
      }
    });
    if (projectile.x > canvas.width - cellSize) {
      projectiles.splice(index, 1);
    }
  });
}
//---------------PROJECTILES---------------
//---------------ENEMIES-------------------
class Enemy {
  constructor(verticalPosition) {
    this.x = canvas.width;
    this.y = verticalPosition;
    this.width = cellSize - cellGap * 2;
    this.height = cellSize - cellGap * 2;
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
    if (enemy.health <= 0) {
      let gainedResources = enemy.maxHealth / 10;
      numberOfResources += gainedResources;
      score += gainedResources;
      let aliveEnemies = enemies.filter((enemy) => enemy.health > 0);
      let enemyPositionIndex = enemiesPosition.indexOf(enemy.y);
      enemiesPosition.splice(enemyPositionIndex, 1);
      enemies = aliveEnemies;
    }
  });
  if (frame % enemiesInterval === 0) {
    let verticalPosition =
      Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
    enemies.push(new Enemy(verticalPosition));
    enemiesPosition.push(verticalPosition);
    if (enemiesInterval > 120) enemiesInterval -= 50;
  }
}
//--------------ENEMIES-------------------
//--------------RESOURCES-----------------
const amounts = [20, 30, 40];
class Resource {
  constructor() {
    this.x = Math.random() * (canvas.width - cellSize);
    this.y = Math.floor(Math.random() * 5 + 1) * cellSize + 25;
    this.width = cellSize * 0.6;
    this.height = cellSize * 0.6;
    this.amount = amounts[Math.floor(Math.random() * amounts.length)];
  }
  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.font = "20px Orbitron";
    ctx.fillText(this.amount, this.x + 15, this.y + 25);
  }
}

function handleResources() {
  if (frame % 500 === 0 && score < winningScore) {
    resources.push(new Resource());
  }
  resources.forEach((resource, index) => {
    resource.draw();
    if (mouse.x && mouse.y && collision(resource, mouse)) {
      numberOfResources += resource.amount;
      resources.splice(index, 1);
    }
  });
}
//--------------RESOURCES-----------------

//---------------UTILITIES----------------

function handleGameStatus() {
  ctx.fillStyle = "black";
  ctx.font = "30px Orbitron";
  ctx.fillText("Resources: " + numberOfResources, 20, 75);
  ctx.fillText("Score: " + score, 20, 35);

  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "60px Orbitron";
    ctx.fillText("GAME OVER", 135, 330);
  }
  if (score > winningScore && enemies.length === 0) {
    ctx.fillStyle = "black";
    ctx.font = "60px Orbitron";
    ctx.fillText("LEVEL COMPLETE", 135, 330);
    ctx.font = "30px Orbitron";
    ctx.fillText("You win with " + score + " points!", 135, 330);
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
  handleGameGrid();
  handleDefenders();
  handleResources();
  handleProjectiles();
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

window.addEventListener("resize", () => {
  canvasPosition = canvas.getBoundingClientRect();
});
