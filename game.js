const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const GRAVITY = 0.7;

// Game State
const State = {
    MENU: 'MENU',
    SELECTION: 'SELECTION',
    PLAYING: 'PLAYING',
    GAMEOVER: 'GAMEOVER'
};

let gameState = State.MENU;
let gameMode = '1P'; // '1P' or '2P'
let p1Selected = null;
let p2Selected = null;

// Assets
const assets = {
    background: new Image(),
    chaves: new Image(),
    kiko: new Image(),
    chiquinha: new Image()
};

assets.background.src = 'assets/background.png';
assets.chaves.src = 'assets/chaves.png';
assets.kiko.src = 'assets/kiko.png';
assets.chiquinha.src = 'assets/chiquinha.png';

const charConfigs = {
    chaves: {
        name: 'Chaves',
        speed: 5,
        jump: 15,
        attackRange: 80,
        damage: 10,
        color: '#81c784',
        weapon: 'Sanduíche'
    },
    kiko: {
        name: 'Kiko',
        speed: 4,
        jump: 12,
        attackRange: 150,
        damage: 8,
        color: '#ffb74d',
        weapon: 'Bola'
    },
    chiquinha: {
        name: 'Chiquinha',
        speed: 7,
        jump: 18,
        attackRange: 60,
        damage: 12,
        color: '#e57373',
        weapon: 'Boneca'
    }
};

class Fighter {
    constructor({ position, velocity, color, side, charKey }) {
        this.position = position;
        this.velocity = velocity;
        this.width = 100;
        this.height = 150;
        this.color = color;
        this.side = side; // 'left' or 'right'
        this.health = 100;
        this.energy = 0;
        this.charKey = charKey;
        this.config = charConfigs[charKey];
        this.isAttacking = false;
        this.isJumping = false;
        this.attackBox = {
            position: { x: this.position.x, y: this.position.y },
            width: this.config.attackRange,
            height: 50
        };
        this.hit = false;
        this.dead = false;
        this.lastAttackTime = 0;
    }

    draw() {
        ctx.save();

        // Draw Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(this.position.x + this.width / 2, 540, 50, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw Character Image
        if (this.hit) ctx.filter = 'brightness(2) contrast(2) sepia(1) hue-rotate(-50deg)';

        // Flip image if facing left (p2 usually)
        if (this.side === 'right') {
            ctx.scale(-1, 1);
            ctx.drawImage(assets[this.charKey], -this.position.x - this.width, this.position.y, this.width, this.height);
        } else {
            ctx.drawImage(assets[this.charKey], this.position.x, this.position.y, this.width, this.height);
        }

        ctx.restore();

        // Draw Attack Box (Debug or Visual Effect)
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            const ax = this.side === 'left' ? this.position.x + this.width : this.position.x - this.config.attackRange;
            ctx.fillRect(ax, this.position.y + 50, this.config.attackRange, 50);
        }
    }

    update() {
        this.draw();

        // Movement
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Boundaries
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > canvas.width) this.position.x = canvas.width - this.width;

        // Gravity
        if (this.position.y + this.height + this.velocity.y >= 540) {
            this.velocity.y = 0;
            this.position.y = 540 - this.height;
            this.isJumping = false;
        } else {
            this.velocity.y += GRAVITY;
        }

        // Heal passive for Chaves
        if (this.charKey === 'chaves' && this.health < 100 && Math.random() < 0.001) {
            this.health = Math.min(100, this.health + 0.5);
        }

        this.hit = false;
    }

    attack() {
        if (Date.now() - this.lastAttackTime < 500) return;
        this.isAttacking = true;
        this.lastAttackTime = Date.now();
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }
}

let player1;
let player2;
let timer = 99;
let timerId;

const keys = {
    a: { pressed: false },
    d: { pressed: false },
    w: { pressed: false },
    f: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
    ArrowUp: { pressed: false },
    l: { pressed: false }
};

function determineWinner({ player1, player2, timerId }) {
    clearTimeout(timerId);
    document.getElementById('game-over').classList.remove('hidden');
    const winnerText = document.getElementById('winner-text');
    if (player1.health === player2.health) {
        winnerText.innerHTML = 'Empate!';
    } else if (player1.health > player2.health) {
        winnerText.innerHTML = `Jogador 1 (${player1.config.name}) Venceu!`;
    } else {
        winnerText.innerHTML = `Jogador 2 (${player2.config.name}) Venceu!`;
    }
    gameState = State.GAMEOVER;
}

function decreaseTimer() {
    if (timer > 0) {
        timerId = setTimeout(decreaseTimer, 1000);
        timer--;
        document.getElementById('timer').innerHTML = timer;
    }

    if (timer === 0) {
        determineWinner({ player1, player2, timerId });
    }
}

function rectangularCollision({ rectangle1, rectangle2 }) {
    const r1ax = rectangle1.side === 'left' ? rectangle1.position.x + rectangle1.width : rectangle1.position.x - rectangle1.config.attackRange;

    return (
        rectangle1.isAttacking &&
        r1ax < rectangle2.position.x + rectangle2.width &&
        r1ax + rectangle1.config.attackRange > rectangle2.position.x &&
        rectangle1.position.y + 50 < rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + 100 > rectangle2.position.y
    );
}

function animate() {
    if (gameState !== State.PLAYING) return;
    window.requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player1.update();
    player2.update();

    player1.velocity.x = 0;
    player2.velocity.x = 0;

    // P1 Movement
    if (keys.a.pressed) player1.velocity.x = -player1.config.speed;
    else if (keys.d.pressed) player1.velocity.x = player1.config.speed;

    // P2 Movement
    if (gameMode === '2P') {
        if (keys.ArrowLeft.pressed) player2.velocity.x = -player2.config.speed;
        else if (keys.ArrowRight.pressed) player2.velocity.x = player2.config.speed;
    } else {
        // Simple AI for P2
        const distance = player1.position.x - player2.position.x;
        if (Math.abs(distance) > player2.config.attackRange - 20) {
            player2.velocity.x = distance > 0 ? player2.config.speed * 0.5 : -player2.config.speed * 0.5;
        } else if (Math.random() < 0.05) {
            player2.attack();
        }

        if (Math.random() < 0.01 && !player2.isJumping) {
            player2.velocity.y = -player2.config.jump;
            player2.isJumping = true;
        }
    }

    // Detect collision player 1 attacking
    if (rectangularCollision({ rectangle1: player1, rectangle2: player2 }) && player1.isAttacking) {
        player2.health -= player1.config.damage;
        player2.hit = true;
        player1.isAttacking = false;
        document.getElementById('p2-health').style.width = player2.health + '%';
        player1.energy = Math.min(100, player1.energy + 5);
        document.getElementById('p1-energy').style.width = player1.energy + '%';
    }

    // Detect collision player 2 attacking
    if (rectangularCollision({ rectangle1: player2, rectangle2: player1 }) && player2.isAttacking) {
        player1.health -= player2.config.damage;
        player1.hit = true;
        player2.isAttacking = false;
        document.getElementById('p1-health').style.width = player1.health + '%';
        player2.energy = Math.min(100, player2.energy + 5);
        document.getElementById('p2-energy').style.width = player2.energy + '%';
    }

    // End game based on health
    if (player1.health <= 0 || player2.health <= 0) {
        determineWinner({ player1, player2, timerId });
    }
}

// UI Handlers
document.getElementById('btn-1p').addEventListener('click', () => {
    gameMode = '1P';
    showSelection();
});

document.getElementById('btn-2p').addEventListener('click', () => {
    gameMode = '2P';
    showSelection();
});

document.getElementById('btn-how').addEventListener('click', () => {
    document.getElementById('how-to-play').classList.remove('hidden');
});

document.getElementById('btn-back').addEventListener('click', () => {
    document.getElementById('how-to-play').classList.add('hidden');
});

function showSelection() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('char-selection').classList.remove('hidden');
    gameState = State.SELECTION;
}

document.querySelectorAll('.char-card').forEach(card => {
    card.addEventListener('click', () => {
        const char = card.getAttribute('data-char');
        if (!p1Selected) {
            p1Selected = char;
            card.classList.add('selected-p1');
            document.getElementById('selection-status').innerHTML = gameMode === '1P' ? 'Selecione o Oponente (CPU)' : 'Selecione P2';
        } else if (!p2Selected && card !== document.querySelector('.selected-p1')) {
            p2Selected = char;
            card.classList.add('selected-p2');
            setTimeout(startGame, 500);
        }
    });
});

function startGame() {
    document.getElementById('char-selection').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');

    player1 = new Fighter({
        position: { x: 100, y: 0 },
        velocity: { x: 0, y: 0 },
        color: '#00FF00',
        side: 'left',
        charKey: p1Selected
    });

    player2 = new Fighter({
        position: { x: 800, y: 0 },
        velocity: { x: 0, y: 0 },
        color: '#FF0000',
        side: 'right',
        charKey: p2Selected
    });

    document.getElementById('p1-name').innerHTML = player1.config.name;
    document.getElementById('p2-name').innerHTML = player2.config.name;

    gameState = State.PLAYING;
    decreaseTimer();
    animate();
}

window.addEventListener('keydown', (event) => {
    if (gameState !== State.PLAYING) return;

    switch (event.key) {
        // P1
        case 'd': keys.d.pressed = true; break;
        case 'a': keys.a.pressed = true; break;
        case 'w':
            if (!player1.isJumping) {
                player1.velocity.y = -player1.config.jump;
                player1.isJumping = true;
            }
            break;
        case 'f': player1.attack(); break;

        // P2
        case 'ArrowRight': keys.ArrowRight.pressed = true; break;
        case 'ArrowLeft': keys.ArrowLeft.pressed = true; break;
        case 'ArrowUp':
            if (!player2.isJumping && gameMode === '2P') {
                player2.velocity.y = -player2.config.jump;
                player2.isJumping = true;
            }
            break;
        case 'l': if (gameMode === '2P') player2.attack(); break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd': keys.d.pressed = false; break;
        case 'a': keys.a.pressed = false; break;
        case 'ArrowRight': keys.ArrowRight.pressed = false; break;
        case 'ArrowLeft': keys.ArrowLeft.pressed = false; break;
    }
});
