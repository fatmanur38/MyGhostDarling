const gameArea = document.getElementById("game-container");
const hud = {
    score: document.getElementById("score"),
    lives: document.getElementById("lives"),
    time: document.getElementById("time"),
};

let score = 0;
let lives = 3;
let isPaused = false;
let manghostPosition = { x: 1, y: 17 };
let enemyDirection = 1; // 1: Sağ, -1: Sol
let enemyPosition = { x: 1, y: 5 }; // Enemy başlangıç pozisyonu
let timeElapsed = 0;
let intervalId;

// Harita verisi: 0 = Duvar, 1 = Yol, 2 = Manghost, 3 = Womanghost, 4 = Düşman, 5 = Çiçek
const mapData = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 5, 0, 5, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
    [0, 1, 0, 5, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 5, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 5, 0, 5, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0],
    [0, 1, 5, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 5, 1, 0],
    [0, 1, 1, 0, 5, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 5, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 5, 0, 1, 1, 0],
    [0, 1, 5, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 5, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 5, 0, 5, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 5, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 5, 0, 1, 0],
    [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
    [0, 2, 1, 1, 1, 0, 1, 1, 1, 1, 1, 5, 0, 5, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Haritayı render et
function renderMap() {
    const mapElement = document.getElementById("map");
    mapElement.innerHTML = "";

    mapData.forEach((row, y) => {
        row.forEach((cell, x) => {
            const div = document.createElement("div");
            div.classList.add("cell");

            if (cell === 0) div.classList.add("wall");
            else if (cell === 1) div.classList.add("path");
            else if (cell === 2) div.classList.add("manghost");
            else if (cell === 3) div.classList.add("womanghost");
            else if (cell === 4) div.classList.add("enemy");
            else if (cell === 5) div.classList.add("flower");

            mapElement.appendChild(div);
        });
    });
}

// Manghost'u hareket ettir
function moveManghost(dx, dy) {
    if (isPaused) return;

    const newX = manghostPosition.x + dx;
    const newY = manghostPosition.y + dy;

    if (
        newX >= 0 &&
        newX < mapData[0].length &&
        newY >= 0 &&
        newY < mapData.length &&
        mapData[newY][newX] !== 0
    ) {
        // Çiçek topla
        if (mapData[newY][newX] === 5) score += 10;

        // Eski pozisyonu temizle
        mapData[manghostPosition.y][manghostPosition.x] = 1;

        // Yeni pozisyonu güncelle
        manghostPosition.x = newX;
        manghostPosition.y = newY;
        mapData[newY][newX] = 2;

        // WomanGhost kontrolü
        if (mapData[newY][newX] === 3) {
            const remainingFlowers = countFlowers();
            if (remainingFlowers === 0) {
                alert("Tüm çiçekler toplandı! Oyun bitti 🎉");
                restartGame();
            } else {
                alert(`Son ${remainingFlowers} çiçek kaldı!`);
            }
        }

        renderMap();
    }
}

// Çiçek sayısını kontrol et
function countFlowers() {
    let flowerCount = 0;
    mapData.forEach((row) => {
        row.forEach((cell) => {
            if (cell === 5) flowerCount++;
        });
    });
    return flowerCount;
}

// Enemy hareketi
function moveEnemy() {
    if (isPaused) return;

    const newX = enemyPosition.x + enemyDirection;

    if (newX < 1 || newX > 5) {
        enemyDirection *= -1; // Yön değiştir
    } else {
        mapData[enemyPosition.y][enemyPosition.x] = 1; // Eski pozisyonu temizle
        enemyPosition.x = newX;
        mapData[enemyPosition.y][enemyPosition.x] = 4; // Yeni pozisyonu güncelle
    }

    // Enemy çarpışma kontrolü
    if (
        enemyPosition.x === manghostPosition.x &&
        enemyPosition.y === manghostPosition.y
    ) {
        lives--;
        if (lives === 0) {
            alert("Oyun bitti! Tüm canlar kaybedildi.");
            restartGame();
        }
    }

    renderMap();
}

// Oyun döngüsü
function gameLoop() {
    if (isPaused) return;

    hud.score.textContent = `Score: ${score}`;
    hud.lives.textContent = `Lives: ${lives}`;
    hud.time.textContent = `Time: ${timeElapsed}s`;

    moveEnemy();
    requestAnimationFrame(gameLoop);
}

// Zamanlayıcı başlat
function startTimer() {
    intervalId = setInterval(() => {
        if (!isPaused) timeElapsed++;
    }, 1000);
}

// Oyun duraklat
function togglePause() {
    isPaused = !isPaused;
    const pauseMenu = document.getElementById("pause-menu");
    pauseMenu.style.display = isPaused ? "flex" : "none";

    if (!isPaused) {
        gameLoop();
    }
}

// Restart işlemi
function restartGame() {
    clearInterval(intervalId);
    score = 0;
    lives = 3;
    timeElapsed = 0;
    manghostPosition = { x: 1, y: 17 };
    enemyPosition = { x: 2, y: 6 };
    enemyDirection = 1;

    // Haritayı sıfırla
    mapData.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === 2 || cell === 3 || cell === 4) mapData[y][x] = 1;
        });
    });
    mapData[17][1] = 2; // Manghost pozisyonu
    mapData[6][2] = 4; // Enemy başlangıç pozisyonu

    togglePause(); // Pause menüsünü kapat
    startGame();
}

// Oyunu başlat
function startGame() {
    renderMap();
    startTimer();
    gameLoop();
}

// Klavye dinleyici
document.addEventListener("keydown", (event) => {
    if (isPaused) return;

    switch (event.key) {
        case "ArrowUp":
            moveManghost(0, -1);
            break;
        case "ArrowDown":
            moveManghost(0, 1);
            break;
        case "ArrowLeft":
            moveManghost(-1, 0);
            break;
        case "ArrowRight":
            moveManghost(1, 0);
            break;
        case "Escape":
            togglePause();
            break;
    }
});

// Başlatma
startGame();
