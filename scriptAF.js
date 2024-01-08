let canvas = document.getElementById("space");
canvas.height = 630;
canvas.width = 630;
let space = canvas.getContext("2d");
let refreshRateInterval;
let score = 0;
let tempo = 700;
let sqr = 30;
let rocks = [];
let beams = [];
let fighter;
let gameStop = false;
let laserLoaded = true;

const keyPress = {
    ArrowLeft: { x: -sqr, y: 0 },
    ArrowRight: { x: sqr, y: 0 },
    ArrowUp: { x: 0, y: -sqr },
    ArrowDown: { x: 0, y: sqr },
    Space: "fireLaser",
};

let imageSrc = {
    fighter: "fighter.png",
    rock: "rock.png",
    blast: "blast.png",
    laser: "laser.png",
    gameOver: "gameover.png",
};
    
function createObject(imageKey, x, y, width, height) {
    let imgObj = new Image();
    imgObj.src = imageSrc[imageKey];
    let object = {
        image: imgObj,
        x: x,
        y: y,
        width: width,
        height: height
    };
    return object;
}

function drawObject(object) {
    space.drawImage(object.image, object.x, object.y, object.width, object.height);
}

function clearObject(object) {
    space.clearRect( object.x, object.y, object.width, object.height);
}

function moveObject(object, x, y) {
    object.x = x;
    object.y = y;
    drawObject(object);
}

function impactCheck(object1, object2) {
    return (
        object1.x <= object2.x + object2.width && object1.x + object1.width >= object2.x &&
        object1.y <= object2.y + object2.height && object1.y + object1.height >= object2.y
    );
}

function startGame() {
    fighter = createObject('fighter', 300, 500, 40, 40);
    document.addEventListener("keydown", function (e) {
        flightActions(e, fighter);
    });
    refreshRateInterval = setInterval(drawGame, tempo);
    drawGame();
}

function drawGame() {
    if (gameStop) {
        return;
    }
    drawObject(fighter);
    objectMovement();
    drawRocks();
    flightActions({ code: null }, fighter);
}

function drawRocks() {
    let noRocks = rocks.length;
    if (noRocks < 20) {
        let xRock = Math.floor(Math.random()* 60) * 10;
        let rock = createObject('rock', xRock, 0, sqr, sqr);
        rocks.push(rock);
        drawObject(rock);
    }
}

function flightActions(e, fighter) {
    if (gameStop) {
        return;
    }
    if (e && keyPress[e.code] && laserLoaded)  {
        const { x, y } = keyPress[e.code];
        const newFighterX = fighter.x + x;
        const newFighterY = fighter.y + y;
        if (newFighterX >= 0 && newFighterX + fighter.width <= canvas.width &&
            newFighterY >= 0 && newFighterY + fighter.height <= canvas.height) {
            clearObject(fighter);
            fighter.x = newFighterX;
            fighter.y = newFighterY;
        }
        drawObject(fighter);
        if (keyPress[e.code] === "fireLaser") {
          fireLaser();
        }
    }
}

function fireLaser() {
    let laser1 = createObject('laser', fighter.x, fighter.y - 5, 10, 20);
    drawObject(laser1);
    beams.push(laser1);
    let laser2 = createObject('laser', fighter.x + 30, fighter.y - 5, 10, 20);
    beams.push(laser2);
    drawObject(laser2);
    setTimeout(() => {
        laserLoaded = true;
    }, 700);
    laserLoaded = false;
}

function objectMovement() {
    if (gameStop) {
        return;
    } 
    rocks.forEach((rock) => {
        clearObject(rock);
        rock.y += sqr;
        moveObject(rock, rock.x, rock.y);
    });
    beams.forEach((laser) => {
        clearObject(laser);
        laser.y -= sqr;
        moveObject(laser, laser.x, laser.y);
    });
    rocks.forEach((rock, indexR) => {
        beams.forEach((laser, indexL) => {
            if (impactCheck(rock, laser)) {
                let blastRock = createObject('blast', rock.x - 15, rock.y - 15, 100, 100);
                clearObject(rock);
                clearObject(laser);
                beams.splice(indexL, 1);
                rocks.splice(indexR, 1);
                blastObject(blastRock);
                ++score;
                document.getElementById("scoreValue").innerHTML = score;
                if (score % 10 == 0 && score > 1) {
                    clearInterval(refreshRateInterval);
                    tempo -= 20;
                    refreshRateInterval = setInterval(drawGame, tempo);
                }
            }
        });
        if (impactCheck(rock, fighter)) {
            clearObject(fighter);
            clearObject(rock);
            let blastFighter = createObject('blast', rock.x - 10, rock.y - 10, 60, 60);
            blastObject(blastFighter);
            gameOver(); 
        } else if (rock.y > 630) {
            rocks.splice(indexR, 1);
            drawRocks();
        }
    });
}

function blastObject(object) {
    setTimeout(() => {
        drawObject(object);
    }, 100);
    setTimeout(() => {
        clearObject(object);
    }, 300);
}

function gameOver() {
    gameStop = true; 
    clearInterval(refreshRateInterval);
    rocks = [];
    beams = [];
    setTimeout(() => {
        space.clearRect(0, 0, 630, 630);
    }, 1000);
    let gameOver = createObject('gameOver', 200, 200, 230, 150);
    setTimeout(() => {
        drawObject(gameOver);
    }, 1300);
}

function restart() {
    location.reload();
}