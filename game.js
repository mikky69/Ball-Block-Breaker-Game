//Game logic in javascript
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 400;

        let score = 0;
        let level = 1;
        let gameOver = false;
        const ballSpeed = 2; // Maintain constant speed for the ball
        let totalPointsToNextLevel = 15; // Points to reach for next level
        const maxBricks = 20; // Maximum number of bricks on screen
        const newBricksDelay = 3000; // Delay in milliseconds before new bricks appear
        let nextBrickIndex = 0; // Index to track the next brick to appear
        let canCreateBricks = true; // Control flag for brick creation

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

        let bricks = []; // Use let instead of const for bricks array
        const brickWidth = 75;
        const brickHeight = 20;

        const sounds = {
            background: new Audio('sounds/Background.wav'),
            hit: new Audio('sounds/hit.mp3'),
            blockBreak: new Audio('sounds/blockBreak.mp3'),
            gameOver: new Audio('sounds/gameOver.mp3')
        };

        function getRandomColor() {
            const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD', '#E67E22', '#2ECC71', '#1ABC9C'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        function createBrick() {
            if (bricks.length < maxBricks && canCreateBricks) { // Limit the number of bricks
                bricks.push({
                    x: Math.random() * (canvas.width - brickWidth),
                    y: Math.random() * (canvas.height / 2), // Limited to upper half
                    status: 1,
                    color: getRandomColor(),
                });
                nextBrickIndex++;
                canCreateBricks = false; // Prevent immediate creation of more bricks
                setTimeout(() => {
                    canCreateBricks = true; // Allow brick creation again after delay
                }, newBricksDelay);
            }
        }

        function playHitSound() {
            sounds.hit.currentTime = 0; // Rewind to start
            sounds.hit.play();
        }

        function playBlockBreakSound() {
            sounds.blockBreak.currentTime = 0; // Rewind to start
            sounds.blockBreak.play();
        }

        function playGameOverSound() {
            sounds.background.pause();
            sounds.background.currentTime = 0; // Reset to start
            sounds.gameOver.play();
        }

        function draw() {
            if (gameOver) return; // Prevent drawing if game is over

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBricks();
            drawBall();
            drawPaddle();

            // Move the ball
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Wall collision
            if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
                ball.dx = -ball.dx;
                score += 1; // Increase score on wall hit
                playHitSound(); // Play hit sound
            }

            // Top collision
            if (ball.y + ball.dy < ball.radius) {
                ball.dy = -ball.dy;
                score += 1; // Increase score on top hit
                playHitSound(); // Play hit sound
            } else if (ball.y + ball.dy > canvas.height - ball.radius) {
                // Paddle collision detection
                if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
                    ball.dy = -ball.dy; // Bounce back
                } else {
                    gameOver = true;
                    playGameOverSound(); // Play game over sound
                    alert('Game Over! Your Score: ' + score);
                    document.location.reload();
                }
            }

            collisionDetection();
            levelUp(); // Check for level up

            document.getElementById('score').innerText = `Score: ${score}`;
            document.getElementById('level').innerText = `Level: ${level}`;

            if (!gameOver) {
                requestAnimationFrame(draw);
            }
        }

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
                        playBlockBreakSound(); // Play block break sound
                    }
                }
            }

            // If all bricks are broken, create new ones after a delay
            if (bricks.every(b => b.status === 0)) {
                setTimeout(() => {
                    for (let i = 0; i < Math.min(level, maxBricks - bricks.length); i++) {
                        createBrick(); // Create new bricks based on the current level
                    }
                }, newBricksDelay);
            }
        }

        function levelUp() {
            if (score >= totalPointsToNextLevel) {
                level++;
                totalPointsToNextLevel += 10; // Increase the points required for the next level
                // Create new bricks for the next level
                for (let i = 0; i < Math.min(level, maxBricks - bricks.length); i++) {
                    createBrick(); // Create new bricks for the next level
                }
            }
        }

        document.addEventListener('mousemove', (event) => {
            const mouseX = event.clientX - canvas.getBoundingClientRect().left;
            paddle.x = mouseX - paddle.width / 2;
            paddle.x = Math.max(0, Math.min(paddle.x, canvas.width - paddle.width)); // Keep paddle within canvas
        });

        document.getElementById('startGame').addEventListener('click', () => {
            document.getElementById('startGame').style.display = 'none';
            document.getElementById('gameCanvas').style.display = 'block';
            document.querySelector('.scoreboard').style.display = 'block'; // Show scoreboard
            document.getElementById('buyBall').style.display = 'block'; // Show buy button
            createBrick(); // Initial brick creation
            playBackgroundMusic(); // Start background music
            draw(); // Start the game loop
        });

        // Placeholder function for wallet connection
        document.getElementById('connectWallet').addEventListener('click', () => {
            // Implement wallet connection logic here
            alert('Wallet connected!'); // Placeholder alert
        });

        function playBackgroundMusic() {
            sounds.background.loop = true; // Loop the background music
            sounds.background.volume = 0.5; // Adjust volume
            sounds.background.play();
        }
   