const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 400;

let score = 0;
let level = 1;
let gameOver = false;
let ballSpeed = 2; // Maintain constant speed for the ball
let totalPointsToNextLevel = 15; // Points to reach to next level
const maxBricks = 20; // Maximum number of bricks on screen
let newBricksDelay = 2000; // Delay in milliseconds before new bricks appear
let nextBrickIndex = 0; // Index to track the next brick to appear

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    dx: ballSpeed,
    dy: -ballSpeed,
    color: getRandomColor(),
};

const paddle = {
    width: 75,
    height: 10,
    x: (canvas.width - 75) / 2,
    color: getRandomColor(),
};

const bricks = [];
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;

function createBrick() {
    if (nextBrickIndex < level && nextBrickIndex < maxBricks) {
        bricks.push({
            x: Math.random() * (canvas.width - brickWidth),
            y: Math.random() * (canvas.height / 2), // Limited to upper half
            status: 1,
            color: getRandomColor(), // Assign a color to the brick
        });
        nextBrickIndex++;
    }
}

function getRandomColor() {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD', '#E67E22', '#2ECC71', '#1ABC9C'];
    return colors[Math.floor(Math.random() * colors.length)];
}

document.addEventListener('mousemove', (event) => {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    paddle.x = mouseX - paddle.width / 2;
});

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let i = 0; i < bricks.length; i++) {
        const b = bricks[i];
        if (b.status === 1) {
            ctx.beginPath();
            ctx.rect(b.x, b.y, brickWidth, brickHeight);
            ctx.fillStyle = b.color; // Use the assigned color for the brick
            ctx.fill();
            ctx.closePath();
        }
    }
}

function collisionDetection() {
    for (let i = 0; i < bricks.length; i++) {
        const b = bricks[i];
        if (b.status === 1) {
            if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                ball.dy = -ball.dy;
                b.status = 0; // Brick is broken
                score += 5; // Increase score
            }
        }
    }

    // If all bricks are broken, create new ones after a delay
    if (bricks.every(b => b.status === 0)) {
        setTimeout(() => {
            createBrick();
            drawBricks();
        }, newBricksDelay);
    }
}

function levelUp() {
    if (score >= totalPointsToNextLevel) {
        level++;
        totalPointsToNextLevel += 10; // Increase the points required for the next level
        // Reset for next level
        nextBrickIndex = 0; // Reset next brick index
        createBrick(); // Create the first brick of the new level
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
        score += 1; // Increase score on wall hit
    }

    // Top collision
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
        score += 1; // Increase score on top hit
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
        } else {
            gameOver = true;
            alert('Game Over! Your Score: ' + score);
            document.location.reload();
        }
    }

    collisionDetection();
    levelUp(); // Check for level up

    document.getElementById('score').innerText = score;
    document.getElementById('level').innerText = level;

    if (!gameOver) {
        requestAnimationFrame(draw);
    }
}

document.getElementById('buyBall').addEventListener('click', () => {
    window.open('https://getgems.io', '_blank'); // Open the marketplace
});

document.getElementById('startGame').addEventListener('click', () => {
    document.getElementById('startGame').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    document.querySelector('.scoreboard').style.display = 'block'; // Show scoreboard
    document.getElementById('buyBall').style.display = 'block'; // Show buy button
    createBrick(); // Initial brick creation
    draw(); // Start the game loop
});