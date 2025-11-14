const board = document.querySelector(".board");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const menu = document.querySelector(".menu");
const startGameSection = document.querySelector(".start-game");
const gameOverSection = document.querySelector(".game-over");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const timeDisplay = document.getElementById("time");

const rows = Math.floor(board.clientHeight / 40);
const cols = Math.floor(board.clientWidth / 40);


// Gesture controls for mobile
let touchStartX = 0,
  touchStartY = 0,
  touchEndX = 0,
  touchEndY = 0;

function handleGesture() {
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30 && direction !== "right") direction = "right";
    else if (dx < -30 && direction !== "left") direction = "left";
  } else {
    if (dy > 30 && direction !== "down") direction = "down";
    else if (dy < -30 && direction !== "up") direction = "up";
  }
}

board.addEventListener(
  "touchstart",
  function (e) {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
    e.preventDefault();
  },
  { passive: false }
);

board.addEventListener(
  "touchmove",
  function (e) {
    if (e.touches.length === 1) {
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    }
    e.preventDefault();
  },
  { passive: false }
);

board.addEventListener(
  "touchend",
  function (e) {
    handleGesture();
    e.preventDefault();
  },
  { passive: false }
);

let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let currentScore = 0;
let time = `00-00`;
let blocks = [];
let interval = null;

let snake = [];
let food = {};
let direction = "down";

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${r}-${c}`] = block;
  }
}

function render() {
  // Clear previous snake and food
  Object.values(blocks).forEach((block) => {
    block.classList.remove("snake-body", "food");
  });

  // Move snake
  let head = snake[0];
  let newHead;
  if (direction === "left") {
    newHead = { x: head.x, y: head.y - 1 };
  } else if (direction === "right") {
    newHead = { x: head.x, y: head.y + 1 };
  } else if (direction === "up") {
    newHead = { x: head.x - 1, y: head.y };
  } else if (direction === "down") {
    newHead = { x: head.x + 1, y: head.y };
  }

  // Check for wall collision
  if (
    newHead.x < 0 ||
    newHead.x >= rows ||
    newHead.y < 0 ||
    newHead.y >= cols
  ) {
    endGame();
    return;
  }

  // Check for self-collision
  if (
    snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
  ) {
    endGame();
    return;
  }

  snake.unshift(newHead);

  // Check if food is eaten
  if (newHead.x === food.x && newHead.y === food.y) {
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
    currentScore++;
    scoreDisplay.textContent = currentScore;
    if (currentScore > highScore) {
      highScore = currentScore;
      localStorage.setItem("highScore", highScore.toString());
      highScoreDisplay.textContent = highScore;
    }
  } else {
    snake.pop();
  }

  // Render snake
  snake.forEach((segment) => {
    const { x, y } = segment;
    blocks[`${x}-${y}`].classList.add("snake-body");
  });
  // Render food
  blocks[`${food.x}-${food.y}`].classList.add("food");
}

document.addEventListener("keydown", (e) => {
  if (menu.style.display !== "none") return; // Ignore input if menu is open
  if (e.key === "ArrowLeft" && direction !== "right") {
    direction = "left";
  } else if (e.key === "ArrowRight" && direction !== "left") {
    direction = "right";
  } else if (e.key === "ArrowUp" && direction !== "down") {
    direction = "up";
  } else if (e.key === "ArrowDown" && direction !== "up") {
    direction = "down";
  }
});

function startGame() {
  // Reset state
  snake = [{ x: 1, y: 3 }];
  direction = "down";
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
  currentScore = 0;
  scoreDisplay.textContent = currentScore;
  time = `00-00`;
  timeDisplay.textContent = "00:00";
  // Hide menu, show board
  menu.style.display = "none";
  startGameSection.classList.remove("active");
  gameOverSection.classList.remove("active");
  // Clear previous interval
  if (interval) clearInterval(interval);
  if (window.timeInterval) clearInterval(window.timeInterval);
  interval = setInterval(render, 400);
  window.timeInterval = setInterval(updateTime, 1000);
}

function endGame() {
  clearInterval(interval);
  if (window.timeInterval) clearInterval(window.timeInterval);
  // Show menu, show only game over section
  menu.style.display = "flex";
  startGameSection.classList.remove("active");
  gameOverSection.classList.add("active");
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

function updateTime() {
  let totalSeconds = parseInt(time.split("-")[1]) + 1;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  time = `${minutes.toString().padStart(2, "0")}-${seconds
    .toString()
    .padStart(2, "0")}`;
  timeDisplay.textContent = time.replace("-", ":");
}

// Initial UI state on load
window.addEventListener("DOMContentLoaded", () => {
  // Show menu, only start-game section
  menu.style.display = "flex";
  startGameSection.classList.add("active");
  gameOverSection.classList.remove("active");
  // Set high score display
  highScoreDisplay.textContent = highScore;
  scoreDisplay.textContent = 0;
  timeDisplay.textContent = "00:00";
});
