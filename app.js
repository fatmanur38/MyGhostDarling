const gameArea = document.getElementById("game-container");
const hud = {
    score: document.getElementById("score"),
    lives: document.getElementById("lives"),
    time: document.getElementById("time"),
    flowers: document.getElementById("flowers"), // Çiçek sayacı için HUD ekle
};

let score = 0;
let lives = 3;
let isPaused = false;
let manghostPosition = { x: 1, y: 17 };
let timeElapsed = 0;
let totalFlowers = 20;  // Toplam çiçek sayısı
let collectedFlowers = 0; // Toplanan çiçek sayısı
let intervalId;

// Flower sayacını güncelle
function updateFlowerCounter() {
    hud.flowers.textContent = `Flowers: ${collectedFlowers}/${totalFlowers}`;
}

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
    updateFlowerCounter();
}


const enemies = [
    { x: 1, y: 13, direction: -1, range: [1, 5], vertical: false }, // 13. satır, 1-5 arası sağdan sola
    { x: 5, y: 5, direction: -1, range: [1, 5], vertical: false },  // 5. satır, 1-5 arası sağdan sola
    { x: 19, y: 13, direction: -1, range: [19, 23], vertical: false }, // 13. satır, 19-23 arası sağdan sola
    { x: 23, y: 5, direction: -1, range: [19, 23], vertical: false },  // 5. satır, 19-23 arası sağdan sola
    { x: 9, y: 7, direction: -1, range: [9, 15], vertical: false }, // 7. satır, 9-15 arası sağdan sola
    { x: 15, y: 11, direction: -1, range: [9, 15], vertical: false },  // 11. satır, 9-15 arası sağdan sola
    { x: 10, y: 1, direction: 1, range: [1, 4], vertical: true },   // 10. sütun, 1-4 arası yukarıdan aşağıya
    { x: 14, y: 4, direction: 1, range: [1, 4], vertical: true },   // 14. sütun, 1-4 arası yukarıdan aşağıya
    { x: 10, y: 14, direction: 1, range: [14, 17], vertical: true }, // 10. sütun, 14-17 arası yukarıdan aşağıya
    { x: 14, y: 17, direction: 1, range: [14, 17], vertical: true }, // 14. sütun, 14-17 arası yukarıdan aşağıya
];

// Düşmanları hareket ettir
function moveEnemies() {
    enemies.forEach((enemy) => {
        // Eski pozisyonu temizle
        mapData[enemy.y][enemy.x] = 1;

        if (enemy.vertical) {
            // Dikey hareket
            enemy.y += enemy.direction;
            if (enemy.y < enemy.range[0] || enemy.y > enemy.range[1]) {
                enemy.direction *= -1; // Yön değiştir
                enemy.y += enemy.direction;
            }
        } else {
            // Yatay hareket
            enemy.x += enemy.direction;
            if (enemy.x < enemy.range[0] || enemy.x > enemy.range[1]) {
                enemy.direction *= -1; // Yön değiştir
                enemy.x += enemy.direction;
            }
        }

        // Yeni pozisyonu güncelle
        mapData[enemy.y][enemy.x] = 4;

        // Çarpışma kontrolü
        if (enemy.x === manghostPosition.x && enemy.y === manghostPosition.y) {
            lives--;
            if (lives === 0) {
                alert("Oyun bitti! Tüm canlar kaybedildi.");
                restartGame();
            }
        }
    });
    renderMap();
}

// Düşmanları 0.4 saniyede bir hareket ettir
setInterval(moveEnemies, 400);


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
        // Eski konumu temizle
        mapData[manghostPosition.y][manghostPosition.x] = 1;

        // Yeni konuma taşı
        manghostPosition.x = newX;
        manghostPosition.y = newY;

        // Çiçek toplama kontrolü
        if (mapData[newY][newX] === 5) {
            collectedFlowers++;
            updateFlowerCounter();
        }
        
        // Woman Ghost ile çarpışma kontrolü
        if (mapData[newY][newX] === 3) {
            if (collectedFlowers === totalFlowers) {
                alert("Tebrikler! Tüm çiçekleri topladınız ve oyunu kazandınız.");
                restartGame();
            } else {
                alert(`${totalFlowers - collectedFlowers} çiçek kaldı, toplamaya devam et!`);
                console.log("ne var",mapData[newY][newX])
                mapData[manghostPosition.y][manghostPosition.x] = 2; // Manghost'un yeni pozisyonunu güncelle
                mapData[newY][newX] = 3
                console.log("ne var1",mapData[newY][newX])
            }
        }else{
            mapData[newY][newX] = 2; // Manghost'un yeni pozisyonunu güncelle
            mapData[9][12]= 3;
        }

        
        renderMap();
    }
}



// Oyun döngüsü
function gameLoop() {
    if (isPaused) return;

    hud.score.textContent = `Score: ${score}`;
    hud.lives.textContent = `Lives: ${lives}`;
    hud.time.textContent = `Time: ${timeElapsed}s`;

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

// Restart fonksiyonu
function restartGame() {
    collectedFlowers = 0;
    manghostPosition = { x: 1, y: 17 }; // Başlangıç pozisyonu
    mapData.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === 2) mapData[y][x] = 1;
            else if (cell === 3) mapData[y][x] = 1; // Woman Ghost'u temizle
            else if (cell === 5) mapData[y][x] = 5; // Çiçekler başlangıca dönsün
        });
    });
    renderMap();
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
