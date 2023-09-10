import { level1 } from './levels/level_1.js';
import { level2 } from './levels/level_2.js';

let levels = [level1, level2];

const stateRunning = 'RUNNING';
const statePaused = 'PAUSED';
const stateReady = 'READY';
const stateGameOver = 'GAME OVER';
const stateWin = 'YOU WIN!!!';
let state = stateReady;

let board;
let boardRight;
let boardLeft;
let boardTop;
let boardBottom;

let ball;
let ballSize;
const defaultSpeedX = -3.7;
const defaultSpeedY = -4;
let speedX;
let speedY;
let ballX;
let ballY;

let bridge;
let bridgeSpeed = 4;
let bridgeDirection = '';
let bridgeX;
let bridgeY;
let bridgeWidth;
let bridgeHeight;
let bridgeWidthDefault;
let isRightDown = false;
let isLeftDown = false;
let bridgeCornerCollisionVariable = 8;
let maxOverlapArea = 10;

let bricks;

let message = '';

let currentLevel = 1;
let levelElement;


let defaultLives = 3;
let lives = defaultLives;

let messageElement;

let score = 0;
let scoreElement;

let timeElement;
let elapsed = 0;
let timerId;

let numberOfBlocks = 0;

const isCollision = (ball, obj) => {
    let rectBall = ball.getBoundingClientRect();
    let rectObj = obj.getBoundingClientRect();

    let b_left = rectBall.left;
    let b_right = rectBall.right;
    let b_top = rectBall.top;
    let b_bottom = rectBall.bottom;


    let o_left = rectObj.left;
    let o_right = rectObj.right;
    let o_top = rectObj.top;
    let o_bottom = rectObj.bottom;

    //Bottom
    if(b_top < o_bottom && b_top > o_top && b_left > o_left && b_left < o_right){
        return 'bottom';
    }
    //Top
    if(b_bottom > o_top && b_bottom <o_bottom && b_left > o_left && b_left < o_right){
        return 'top';
    }

    //Left
    if(b_right>o_right && b_right < o_left && b_top > o_top && b_bottom<o_bottom){
        return 'left';
    }

    //Right
    if(b_top>o_top && b_bottom<o_bottom && b_left<o_right && b_left>o_left){
        return 'right'
    }

    //topLeft
    if(b_bottom>o_top && b_top < o_top && b_right>o_left && b_left < o_left){
        return 'topLeft'
    }

    //topRight
    if(b_left < o_right && b_right>o_right && b_bottom>o_top && b_top < o_top){
        return 'topRight'
    }

    //bottomLeft
    if(b_top<o_bottom && b_bottom > o_bottom && b_right>o_left && b_left < o_left){
        return 'bottomLeft'
    }
    //bottomRight
    if(b_top < o_bottom && b_bottom> o_bottom && b_left < o_right && b_right > o_right){
        return 'bottomRight'
    }
    return '';
}

const buildWalls = () => {
    for (let i = 0; i < 20; i++) {
        let div = document.createElement('div');
        div.classList.add('wall-block')
        div.style.left = `${boardLeft - 25}px`;
        div.style.top = `${boardTop + i * 25}px`;
        board.append(div);
    }
    for (let i = -1; i < 13; i++) {
        let div = document.createElement('div');
        div.classList.add('wall-block')
        div.style.left = `${boardLeft + i * 25}px`;
        div.style.top = `${boardTop - 25}px`;
        board.append(div);
    }
    for (let i = 0; i < 20; i++) {
        let div = document.createElement('div');
        div.classList.add('wall-block')
        div.style.left = `${boardLeft + boardRight}px`;
        div.style.top = `${boardTop + i * 25}px`;
        board.append(div);
    }
}

const updateTime = () => {
    elapsed++;
    const date = new Date(null);
    date.setSeconds(elapsed);
    const result = date.toISOString().slice(11, 19);   
    timeElement.textContent = result;
}

const updateLevel = () => {
    levelElement.textContent = `Level: ${currentLevel}`;
}

const setState = (st) => {
    state = st;
    message = '';
    switch (state) {
        case stateRunning:
            timerId = setInterval(updateTime, 1000);
            break;
        case statePaused:
            message = 'Pause<br><span class="sub-message">Press space to resume<br>Press escape to restart</span>';
            clearInterval(timerId);
            break;
        case stateReady:
            ball.style.display = 'block';
            message = 'Ready';
            clearInterval(timerId); 
            break;
        case stateGameOver:
            message = 'Game Over<br><span class="sub-message">Tap space to play again</span>';
            ball.style.display = 'none';
            clearInterval(timerId);    
            break;
        case stateWin:
            message = 'You Win!!!\n<span class="sub-message">Tap space to play again</span>';
            ball.style.display = 'none';
            clearInterval(timerId);
            break;
    }
    messageElement.innerHTML = message;
}

const updateScore = (number) => {
    score = score + number;
    scoreElement.textContent = score;
}

const resetGame = () => {
    currentLevel = 1;
    score = 0;
    updateScore(score);
    updateLevel()
    setLevel();
    lives = defaultLives;
    elapsed = -1;
    updateTime();
    setState(stateReady);
    setBridgeImage();
    bridgeWidth = bridgeWidthDefault;
    bridge.style.width = `${bridgeWidth}px`;
    speedX = defaultSpeedX;
    speedY = defaultSpeedY;
    bridgeX = (boardRight - boardLeft - bridgeWidth)/2;
    bridge.style.left = `${bridgeX}px`;
}

const init = () => {
    //Intit board
    board = document.querySelector('#board');
    boardLeft = 0;
    boardTop = 0;
    let style = window.getComputedStyle(board);
    boardRight = parseInt(style.width.replace('px', ''));
    boardBottom = parseInt(style.height.replace('px', ''));
    buildWalls();

    //Init ball
    ball = document.querySelector('#current-ball');
    style = window.getComputedStyle(ball);
    ballSize = parseInt(style.width.replace('px', ''));
    ballX = parseInt(style.left.replace('px', ''));
    ballY = parseInt(style.top.replace('px', ''));
    speedX = defaultSpeedX;
    speedY = defaultSpeedY;

    //Init bridge
    bridge = document.querySelector('#bridge');
    style = window.getComputedStyle(bridge);
    bridgeWidthDefault = parseInt(style.width.replace('px', ''));
    bridgeWidth = bridgeWidthDefault;
    bridgeX = (boardRight - boardLeft - bridgeWidth) / 2;
    bridgeHeight = parseInt(style.height.replace('px', ''));
    bridgeY = boardBottom - bridgeHeight;
    bridge.style.left = `${bridgeX}px`;
    bridge.style.top = `${bridgeY}px`;

    //Message 
    messageElement = document.querySelector('#message');

    //Timer 
    timeElement = document.querySelector('#time-value');

    //Level Element
    levelElement = document.querySelector('#current-level');
    updateLevel();

    setState(stateReady);

    //Set Level
    setLevel();

    //Score
    scoreElement = document.querySelector('#score-value');

    //Set event listeners
    document.addEventListener("keydown", (e) => {
        if (e.isComposing || e.keyCode === 229) {
            return;
        }
        if (e.key === 'ArrowRight') {
            isRightDown = true;
        }
        if (e.key === 'ArrowLeft') {
            isLeftDown = true;
        }
        if (e.key === ' ') {

            switch (state) {
                case stateReady:
                    setState(stateRunning);
                    break;

                case stateRunning:
                    setState(statePaused);
                    break;

                case statePaused:
                    setState(stateRunning);
                    break;

                case stateGameOver:
                    resetGame();
                    break;
                case stateWin:
                    resetGame();
                    break;
            }
        }
        if(e.key === 'Escape' && state === statePaused){
            resetGame();
            setState(stateReady);
        }

    });

    document.addEventListener("keyup", (e) => {
        if (e.isComposing || e.keyCode === 229) {
            return;
        }
        if (e.key === 'ArrowRight') {
            isRightDown = false;
        }
        if (e.key === 'ArrowLeft') {
            isLeftDown = false;
        }
    });

}

const setBridgeImage = () => {

    switch (lives) {
        case 3:
            bridge.style.backgroundImage = "url('/images/bridge_2.jpg')";
            break;
        case 2:
            bridge.style.backgroundImage = "url('/images/bridge_1.jpg')";
            break;
        default:
            bridge.style.backgroundImage = "url('/images/bridge_0.jpg')";
    }
}

const setLevel = () => {

    numberOfBlocks = 0;

    //Clear Bricks and Blocks
    let el = document.getElementsByClassName('brick');
    while (el.length > 0) {
        el[0].parentNode.removeChild(el[0]);
    }
    el = document.getElementsByClassName('block');
    while (el.length > 0) {
        el[0].parentNode.removeChild(el[0]);
    }

    //Bricks
    bricks = JSON.parse(JSON.stringify(levels[currentLevel - 1]));
    bricks.forEach(brick => {
        let div = document.createElement('div');
        div.setAttribute('id', brick.id);
        div.style.position = 'absolute';
        div.style.width = brick.width + 'px';
        div.style.height = brick.height + 'px';
        let left = parseInt(brick.x) + parseInt(boardLeft);
        div.style.left = left.toString() + 'px';
        let top = parseInt(brick.y) + parseInt(boardTop);
        div.style.top = top.toString() + 'px';
        div.style.backgroundSize = 'cover';
        div.style.zIndex = 1;

        if (brick.type === 'normal') {
            if (brick.color === 'red') {
                div.style.backgroundImage = "url('/images/red_brick.jpg')";
            } else if (brick.color === 'yellow') {
                div.style.backgroundImage = "url('/images/yellow_brick.jpg')";
            } else if (brick.color === 'purple') {
                div.style.backgroundImage = "url('/images/purple_brick.jpg')";
            } else if (brick.color === 'green') {
                div.style.backgroundImage = "url('/images/green_brick.jpg')";
            }
            else {
                div.style.backgroundColor = brick.color;
            }
            div.classList.add('brick');
        }

        if (brick.type === 'block') {
            numberOfBlocks++;
            if (brick.color === 'blue') {
                div.style.backgroundImage = "url('/images/blue_block.jpeg')";
            }
            div.classList.add('block');
        }

        board.appendChild(div);
    });

    setBridgeImage();
}

const checkLevelStatus = () => {
    if (bricks.length - numberOfBlocks <= 0) {
        currentLevel++;
        if (currentLevel > levels.length) {
            setState(stateWin);
        } else {
            clearInterval(timerId);
            setState(stateReady);
            elapsed = -1;
            updateTime();
            updateLevel();
            setLevel();
            speedX = defaultSpeedX;
            speedY = defaultSpeedY;
        }
    }
}

const setBrickToDamaged = (brick, img) => {
    document.getElementById(brick.id).style.backgroundImage = `url('/images/${img}')`;
}
const handleBrickCollision = (brick) => {
    if (brick.type === 'normal') {
        document.getElementById(brick.id).remove();
        bricks = bricks.filter(item => item.id !== brick.id);
        updateScore(1);
        checkLevelStatus();
        return;
    }
    if (brick.type === 'hard') {
        let index = bricks.indexOf(brick);
        bricks[index].type = 'damaged';
        let color = bricks[index].color;
        switch (color) {
            case 'purple':
                setBrickToDamaged(bricks[index], 'purple_brick_damaged.jpg');
                break;
            case 'red':
                setBrickToDamaged(bricks[index], 'red_brick_damaged.jpg');

                break;
            case 'yellow':
                setBrickToDamaged(bricks[index], 'yellow_brick_damaged.jpg');
                break;
            case 'green':
                setBrickToDamaged(bricks[index], 'green_brick_damaged.jpg');
                break;
        }
        return;
    }
    if (brick.type === 'damaged') {

        let x = brick.x + 5;
        let y = brick.y + brick.height;
        document.getElementById(brick.id).remove();
        bricks = bricks.filter(item => item.id !== brick.id);
        updateScore(1);
        checkLevelStatus();
        dropPowerUp(x, y);
        return;
    }
}

const checkCollisions = () => {
    //Check wall collisions
    //1. Left wall
    if (ballX < boardLeft) {
        ballX -= speedX;
        speedX = -speedX;
        return;
    }
    //2. Right wall
    if (ballX > (boardRight - ballSize)) {
        ballX -= speedX;
        speedX = -speedX;
        return;
    }
    //3. Check for top wall
    if (ballY < boardTop) {
        ballY -= speedY;
        speedY = -speedY;
        return;
    }
    //4. Check for bottom wall
    if (ballY > (boardBottom - ballSize)) {
        //ballY -= speedY;
        //speedY = -speedY;
        lives--;
        if (lives <= 0) {
            setState(stateGameOver);
        } else {
            speedX = defaultSpeedX;
            speedY = defaultSpeedY;
            setState(stateReady);
            setBridgeImage();
        }

        return;
    }


    //Bridge collisions


    //Ball middle points
    let ballLeft = { x: ballX, y: ballY + ballSize / 2 };
    let ballTop = { x: ballX + ballSize / 2, y: ballY };
    let ballRight = { x: ballX + ballSize, y: ballY + ballSize / 2 };
    let ballBottom = { x: ballX + ballSize / 2, y: ballY + ballSize };

    //Check top wall of bridge
    if (ballBottom.x > bridgeX && ballBottom.x < bridgeX + bridgeWidth && ballBottom.y > bridgeY) {    
        ballY  = ballY - speedY;
        ballX  = ballX - speedX;

        if (bridgeDirection === 'left' && bridgeX > boardLeft) {
            //Bridge is moving to the left           
            if (speedX > 0) {
                let v = speedX ** 2 + speedY ** 2;
                speedY = -speedY / 2;
                speedX = Math.sqrt(v - speedY ** 2);
            } else if (speedX < 0) {
                let v = speedX ** 2 + speedY ** 2;
                speedX = speedX / 2;
                speedY = - Math.sqrt(v - speedX ** 2);
            } else {
                speedY = -speedY;
            }
            ballY += speedY;
        } else if (bridgeDirection === 'right' && (bridgeX + bridgeWidth) < boardRight) {
            //Bridge is moving to the right           
            if (speedX > 0) {
                let v = speedX ** 2 + speedY ** 2;
                speedX = speedX / 2;
                let speedYAdj = Math.sqrt(v - speedX ** 2);
                if (speedY > 0) {
                    speedY = -speedYAdj
                } else {
                    speedY = speedYAdj;
                }
            } else if (speedX < 0) {
                let v = speedX ** 2 + speedY ** 2;
                speedY = -speedY / 2;
                speedX = -Math.sqrt(v - speedY ** 2);
            } else {
                speedY = -speedY;
            }
        } else {
            //Bridge is not moving
            speedY = -speedY;
        }
        ballY += speedY;
    }

    //Check left wall top half of bridge
    if(ballRight.x > bridgeX && ballRight.x < bridgeX + bridgeWidth && ballRight.y > bridgeY && ballRight.y <= bridgeY + bridgeHeight/2){       
        ballX = ballX - speedX;
        ballY = ballY - speedY;
        speedX = -speedX;
        speedY = -speedY;
    }

    //Check left wall bottom half of bridge
    if(ballRight.x > bridgeX && ballRight.x < bridgeX + bridgeWidth && ballRight.y > bridgeY + bridgeHeight/2 && ballRight.y < bridgeY + bridgeHeight){       
        ballX = ballX - speedX;
        ballY = ballY - speedY;
        speedX = -speedX;
    }
        
    //Check right wall top half
    if(ballLeft.x > bridgeX && ballLeft.x < bridgeX + bridgeWidth && ballLeft.y > bridgeY && ballLeft.y <= bridgeY + bridgeHeight/2){       
        ballX = ballX - speedX;
        ballY = ballY - speedY;
        speedX = -speedX;
        speedY = -speedY;
    }

    //Check right wall bottom half
    if(ballLeft.x > bridgeX && ballLeft.x < bridgeX + bridgeWidth && ballLeft.y > bridgeY +  bridgeHeight/2 && ballLeft.y < bridgeY + bridgeHeight){        
        ballX = ballX - speedX;
        ballY = ballY - speedY;
        speedX = -speedX;
    }


    //Brick Collisions
    for (let i = 0; i < bricks.length; i++) {
        let brick = bricks[i];
        let left = brick.x;
        let right = left + brick.width;
        let top = brick.y;
        let bottom = top + brick.height
        //Check bottom wall
        if (ballTop.x > left && ballTop.x < right && ballTop.y > top && ballTop.y < bottom) {
            ballY = bottom;
            speedY = -speedY;
            handleBrickCollision(brick);
            break;
        }
        //Check left wall
        if (ballRight.x > left && ballRight.x < right && ballRight.y > top && ballRight.y < bottom) {
            ballX = left - ballSize;
            speedX = -speedX;
            handleBrickCollision(brick);
            break;
        }
        //Check right wall
        if (ballLeft.x > left && ballLeft.x < right && ballLeft.y > top && ballLeft.y < bottom) {
            ballX = right;
            speedX = -speedX;
            handleBrickCollision(brick);
            break;
        }
        //Check top wall
        if (ballBottom.x > left && ballBottom.x < right && ballBottom.y > top && ballBottom.y < bottom) {
            ballY = top - ballSize;
            speedY = -speedY;
            handleBrickCollision(brick);
            break;
        }
    }
}

const startGame = () => {
    init();
    requestAnimationFrame(run);
}

function run() {

    if (state === statePaused) {
        requestAnimationFrame(run);
        return;
    }

    if (state === stateGameOver) {
        requestAnimationFrame(run);
        return;
    }

    //Calculate bridge
    if (isLeftDown && !isRightDown) bridgeDirection = 'left';
    if (isRightDown && !isLeftDown) bridgeDirection = 'right';
    if (isLeftDown && isRightDown) bridgeDirection = '';
    if (!isLeftDown && !isRightDown) bridgeDirection = '';
    if (bridgeDirection === 'right') {
        bridgeX += bridgeSpeed;
    }
    if (bridgeDirection === 'left') {
        bridgeX -= bridgeSpeed;
    }
    if (bridgeX < boardLeft) bridgeX = boardLeft;
    if (bridgeX > (boardRight - bridgeWidth)) bridgeX = boardRight - bridgeWidth;
    bridge.style.left = `${bridgeX}px`;

    if (state === stateReady) {
        ballX = bridgeX + bridgeWidth / 2 - ballSize / 2;
        ballY = bridgeY - ballSize;
        ball.style.left = `${ballX}px`;
        ball.style.top = `${ballY}px`;
    }

    if (state === stateRunning) {
        ballX += speedX;
        ballY += speedY;
        checkCollisions();
        ball.style.left = `${ballX}px`;
        ball.style.top = `${ballY}px`;
    }
    requestAnimationFrame(run);
}

startGame();