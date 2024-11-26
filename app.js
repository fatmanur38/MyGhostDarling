const gameArea = document.getElementById("game-container");
const hud = {
    score: document.getElementById("score"),
    lives: document.getElementById("lives"),
    time: document.getElementById("time"),
    flowers: document.getElementById("flowers"), // Çiçek sayacı için HUD ekle
};

// Yeni bir ses nesnesi oluştur
const gameMusic = new Audio("./assets/music.mp3");
gameMusic.loop = true; // Müziğin sürekli çalması için

let score = 0;
let lives = 3;
let isPaused = true;
let manghostPosition = { x: 1, y: 17 };
let timeElapsed = 0;
let totalFlowers = 20;  // Toplam çiçek sayısı
let collectedFlowers = 0; // Toplanan çiçek sayısı
let intervalId;
let enemyIntervalId; // Düşman hareketi için interval ID

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

const originalMapData = JSON.parse(JSON.stringify(mapData)); // Başlangıç haritasını sakla

// Oyunun başlangıç ekranını oluştur
function createStartScreen() {
    const startScreen = document.createElement("div");
    startScreen.id = "start-screen";
    startScreen.style.position = "absolute";
    startScreen.style.top = "0";
    startScreen.style.left = "0";
    startScreen.style.width = "100%";
    startScreen.style.height = "100%";
    startScreen.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    startScreen.style.display = "flex";
    startScreen.style.flexDirection = "column";
    startScreen.style.justifyContent = "center";
    startScreen.style.alignItems = "center";
    startScreen.style.zIndex = "1000";

    // PNG Görseli
    const pngImage = document.createElement("img");
    pngImage.src = "./assets/start.png"; // Görselin yolunu buraya yazın
    pngImage.alt = "Start";
    pngImage.style.width = "300px"; // Görselin genişliği
    pngImage.style.marginBottom = "20px"; // Görselin alt boşluğu

    // Play Butonu
    const playButton = document.createElement("button");
    playButton.textContent = "Play";
    playButton.style.padding = "10px 20px";
    playButton.style.fontSize = "20px";
    playButton.style.cursor = "pointer";
    playButton.style.border = "none";
    playButton.style.borderRadius = "5px";
    playButton.style.backgroundColor = "#28a745";
    playButton.style.color = "white";

    playButton.addEventListener("click", () => {
        document.body.removeChild(startScreen); // Başlangıç ekranını kaldır
        startGame(); // Oyunu başlat
        gameMusic.play(); // Müziği başlat
    });

    startScreen.appendChild(pngImage);
    startScreen.appendChild(playButton);
    document.body.appendChild(startScreen);
}


function displayGameOverScreen() {
    const gameOverScreen = document.createElement("div");
    gameOverScreen.id = "game-over-screen";
    gameOverScreen.style.position = "absolute";
    gameOverScreen.style.top = "0";
    gameOverScreen.style.left = "0";
    gameOverScreen.style.width = "100%";
    gameOverScreen.style.height = "100%";
    gameOverScreen.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    gameOverScreen.style.display = "flex";
    gameOverScreen.style.flexDirection = "column";
    gameOverScreen.style.justifyContent = "center";
    gameOverScreen.style.alignItems = "center";
    gameOverScreen.style.zIndex = "1000";

    // PNG Görseli
    const gameOverImage = document.createElement("img");
    gameOverImage.src = "./assets/gameover.png"; // Görselin yolunu buraya yazın
    gameOverImage.alt = "Game Over";
    gameOverImage.style.width = "300px"; // Görselin genişliği
    gameOverImage.style.marginBottom = "20px"; // Görselin alt boşluğu

    // Restart Butonu
    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart";
    restartButton.style.padding = "10px 20px";
    restartButton.style.fontSize = "20px";
    restartButton.style.cursor = "pointer";
    restartButton.style.border = "none";
    restartButton.style.borderRadius = "5px";
    restartButton.style.backgroundColor = "#dc3545";
    restartButton.style.color = "white";

    
    restartButton.addEventListener("click", () => {
        document.body.removeChild(gameOverScreen); // Oyun bitiş ekranını kaldır
        restartGame(); // Oyunu yeniden başlat
    });

    gameOverScreen.appendChild(gameOverImage);
    gameOverScreen.appendChild(restartButton);
    document.body.appendChild(gameOverScreen);
}

// Kazanma ekranını gösteren fonksiyon
function displayWinScreen(finalScore) {
    const winScreen = document.createElement("div");
    winScreen.id = "win-screen";
    winScreen.style.position = "absolute";
    winScreen.style.top = "0";
    winScreen.style.left = "0";
    winScreen.style.width = "100%";
    winScreen.style.height = "100%";
    winScreen.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    winScreen.style.display = "flex";
    winScreen.style.flexDirection = "column";
    winScreen.style.justifyContent = "center";
    winScreen.style.alignItems = "center";
    winScreen.style.zIndex = "1000";

    // PNG Görseli
    const winImage = document.createElement("img");
    winImage.src = "./assets/win.png"; // Görselin yolunu buraya yazın
    winImage.alt = "You Win!";
    winImage.style.width = "300px"; // Görsel genişliği
    winImage.style.marginBottom = "20px"; // Alt boşluk

    // Nihai skor
    const scoreText = document.createElement("p");
    scoreText.textContent = `Final Score: ${finalScore}`;
    scoreText.style.color = "white";
    scoreText.style.fontSize = "24px";
    scoreText.style.marginBottom = "20px";

    // Restart Butonu
    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart";
    restartButton.style.padding = "10px 20px";
    restartButton.style.fontSize = "20px";
    restartButton.style.cursor = "pointer";
    restartButton.style.border = "none";
    restartButton.style.borderRadius = "5px";
    restartButton.style.backgroundColor = "#007bff";
    restartButton.style.color = "white";

    restartButton.addEventListener("click", () => {
        document.body.removeChild(winScreen); // Kazanma ekranını kaldır
        gameMusic.currentTime = 0; // Müziği başa sar
        gameMusic.play(); // Müziği yeniden başlat
        restartGame(); // Oyunu yeniden başlat
    });

    winScreen.appendChild(winImage);
    winScreen.appendChild(scoreText);
    winScreen.appendChild(restartButton);
    document.body.appendChild(winScreen);
}

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
                displayGameOverScreen(); // Oyun bitiş ekranını göster
            }
        }
    });
    renderMap();
}

// Oyun başlatılırken düşman hareketi intervalini başlat
enemyIntervalId = setInterval(moveEnemies, 400);


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
            score += 20;
            updateFlowerCounter();
        }
        
        // Woman Ghost ile çarpışma kontrolü
        if (mapData[newY][newX] === 3) {
            if (collectedFlowers === totalFlowers) {
                const timeScore = 5000 - (30 - timeElapsed)*20;
                const finalScore = score + timeScore ;
                displayWinScreen(finalScore); // Kazanma ekranını göster
            } else {
                alert(`${totalFlowers - collectedFlowers} çiçek kaldı, toplamaya devam et!`);
                mapData[newY-1][newX] = 2; // Manghost'un yeni pozisyonunu güncelle
                mapData[newY][newX] = 3

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


function startTimer() {
    clearInterval(intervalId); // Eski zamanlayıcıyı temizle
    intervalId = setInterval(() => {
        if (!isPaused) {
            timeElapsed++;
            hud.time.textContent = `Time: ${timeElapsed}`;
        }
    }, 1000); // Zamanlayıcıyı başlat (1 saniye aralıklarla)
}

const pauseMenu = document.getElementById("pause-menu");
// Oyun duraklat
function togglePause() {
    isPaused = !isPaused;
    pauseMenu.style.display = isPaused ? "flex" : "none";

    if (isPaused) {
        clearInterval(enemyIntervalId); // Düşmanların hareketini durdur
    } else {
        enemyIntervalId = setInterval(moveEnemies, 400); // Düşmanları tekrar hareket ettir
        gameMusic.play(); // Müziği devam ettir
        gameLoop();
    }
}

function restartGame() {
    // Haritayı başlangıç haline getir
    mapData.length = 0; // Mevcut haritayı boşalt
    originalMapData.forEach(row => mapData.push([...row])); // Haritayı orijinal haliyle doldur

    // Oyun durumunu sıfırla
    score = 0;
    lives = 3;
    timeElapsed =0;
    collectedFlowers = 0;
    manghostPosition = { x: 1, y: 17 };
    isPaused =false;
    // HUD'yi güncelle
    hud.score.textContent = `Score: ${score}`;
    hud.lives.textContent = `Lives: ${lives}`;
    hud.time.textContent =`Time: ${timeElapsed}s`;
    updateFlowerCounter();
    
    clearInterval(enemyIntervalId);
    enemyIntervalId = setInterval(moveEnemies, 500);
    // Haritayı yeniden oluştur
    pauseMenu.style.display = "none";
    gameMusic.currentTime = 0; // Müziği başa sar
    gameMusic.play(); // Müziği yeniden başlat
    startGame();
}

// Oyunu başlat
function startGame() {
    isPaused = false;
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
            gameMusic.pause(); // Müziği durdur
            break;
    }
});

// Sayfa yüklendiğinde başlangıç ekranını göster
window.onload = () => {
    createStartScreen();
};