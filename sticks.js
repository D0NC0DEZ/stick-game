let sticks = 21;
let playersTurn = true;
let gameOver = false;
let difficulty = "medium";
let goesFirst = "player";
let animating = false;
let winStreak = 0;
let currentRoast = "";
let lastResult = null;

let soundMode = parseInt(localStorage.getItem("stick_soundmode") || "0", 10);
let musicNodes = null;
let tensionLevel = 0;

let roastMessages = [
    "My grandma plays better than you, and she's a lamp.",
    "Congratulations, you found the one way to lose at a 2-option game.",
    "The sticks feel sorry for you. I don't.",
    "Even on Easy mode? Really?",
    "That was so bad the computer felt bad for winning.",
    "You had ONE job. Don't take the last stick. You took it anyway.",
    "Are you sure you don't want to switch to Tic-Tac-Toe?",
    "The sticks have filed a restraining order against your strategy.",
    "Bold of you to lose this hard. Most people try harder by accident.",
    "I've seen better decision-making from a coinflip.",
    "Somewhere, a rock just outsmarted you.",
    "The AI didn't even have to try. It's embarrassed for you.",
    "You didn't just lose. You lost with *style*.",
    "Stick Game? More like Slick Game because you just slid right into defeat.",
    "Plot twist: the sticks were the real winners here.",
    "Have you considered a career in losing? You're a natural.",
    "That move was so bad it has its own Wikipedia page.",
    "Even a goldfish would've seen that coming.",
    "The computer just wrote in its diary: 'Easiest win ever.'",
    "That wasn't a strategy. That was a cry for help.",
    "The computer didn't beat you. You defeated yourself. Twice. Out of respect.",
    "You lost to a pile of wooden sticks while a lamp outshines you.",
    "If taking the L was an Olympic sport, they'd ban you for being TOO good.",
    "Your strategy is a GPS that only knows wrong turns.",
    "I would say 'better luck next time' but you'd just lose that, too.",
    "You made the sticks question their whole existence.",
    "Scientists want to study you to find out how someone loses THIS badly.",
    "A random number generator just beat you. You lost to static, buddy.",
    "You've got main character energy... of the character who dies first.",
    "Even the loading screen survived longer than your winning chances.",
    "The tree that became those sticks is crying, and it's your fault.",
    "This game requires exactly one brain cell. You brought zero.",
    "You're the reason tutorials include 'don't do this'.",
    "gg = Good Game? More like Gone wrong. Gone wrong, Gamer.",
    "The computer just wrote in its diary AGAIN: 'free win, lol.'",
    "Bold move, losing the easiest game in the universe.",
    "The sticks filed a restraining order. They feel unsafe around your logic.",
    "Somewhere, a piñata is taking notes on your stick handling skills.",
    "You hugged the last stick like it was your childhood blanket. It betrayed you.",
    "Diagnosis: terminal skill issue.",
    "The AI is literally a handful of if-statements. You lost to homework.",
    "Career change idea: anything that doesn't involve choosing between 1 and 2.",
    "You played like the wifi was lagging, and it wasn't.",
    "The delete key worked better on your win streak than your brain does.",
    "Even the odds felt pity for you."
];

let winSubs = [
    "The AI took the last stick. You actually did it!",
    "Victory! The computer finally slipped up.",
    "You won a game. Frame this. Buy a golden frame.",
    "The AI's circuits are crying. You earned this.",
    "Champion detected. The sticks are DONE.",
    "You out-sticked the stick master. Impressive.",
    "Mercy? No. That was just *skill*.",
    "The computer threw the game. 'Cause it's scared of you now.",
    "You make main character energy look easy, champ."
];

let loseStings = ["L + Ratio", "Get Stickbugged", "Skill Issue (Certified)", "Denied", "RIP bozo", "Oof, and I mean big oof", "Certified Buster", "GG ez — for the sticks"];

let winMascots = ["🏆", "🎉", "👑", "🌟", "🦅"];
let loseMascots = ["🤡", "😭", "🗿", "💀", "🚽"];

let taunts = [
    "Is that all you've got?",
    "My servos are bored, champ.",
    "The sticks are laughing at you.",
    "I've won this game in my sleep. Literally. I don't sleep.",
    "Careful, I might start trying.",
    "You're heating up my cooling fan. From laughter.",
    "Even easy mode is embarrassed for you.",
    "I calculated your odds. Not great.",
    "Your strategy is derping nicely.",
    "2 choices. 1 loser. Guessing it's you.",
    "Little secret: I've already run the simulations. I win.",
    "I simulated the future. You're not in it.",
    "A rubber duck out-thinks you sometimes, right?",
    "My dial-up modem has faster decision-making.",
    "This is like playing chess with a pigeon.",
    "Breathe. It's just a pile of sticks. For now.",
    "I've already won. Inform your sticks.",
    "The last stick is homesick for your inefficiency."
];

let idleTaunts = [
    "Hello? Lagging? Or just lost?",
    "I've recalculated. Still beating you.",
    "The sticks are getting bored.",
    "Tick tock, genius.",
    "Daydreaming? The sticks noticed. They're rude.",
    "Take your time. Doesn't change the outcome.",
    "I ran 10,000 simulations while you admired the view."
];

let achDefs = [
    { id: "firstWin", name: "First Blood", emoji: "🏆" },
    { id: "hardWin", name: "Brainiac", emoji: "🧠" },
    { id: "streak2", name: "On Fire", emoji: "🔥" },
    { id: "streak3", name: "Unstoppable", emoji: "⚡" },
    { id: "streak5", name: "Scorching", emoji: "🌋" },
    { id: "streak10", name: "Dominator", emoji: "👑" },
    { id: "firstLose", name: "Welcome to the L Club", emoji: "💀" },
    { id: "loseEasy", name: "Pity Party", emoji: "🫠" },
    { id: "fallen", name: "The Fallen", emoji: "☠️" },
    { id: "roast10", name: "Roast Collector", emoji: "🥧" },
    { id: "games10", name: "Veteran", emoji: "🎮" },
    { id: "games25", name: "Marathon Man", emoji: "🏃" }
];

/* ── Audio (Web Audio API) ── */
let audioCtx = null;
function getAudio() {
    if (!audioCtx) {
        try {
            let AC = window.AudioContext || window.webkitAudioContext;
            if (AC) audioCtx = new AC();
        } catch (e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(function () {});
    }
    return audioCtx;
}

function playTone(freq, start, dur, type, volume, slideTo) {
    let ctx = getAudio();
    if (!ctx || soundMode === 2) return;
    let o = ctx.createOscillator();
    let g = ctx.createGain();
    let t = ctx.currentTime + start;
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volume || 0.16, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
}

function playWinFanfare() {
    if (soundMode === 2) return;
    let seq = [523.25, 659.25, 783.99, 1046.5, 1318.52];
    seq.forEach(function (f, i) {
        playTone(f, i * 0.13, 0.4, "triangle", 0.16);
        playTone(f / 2, i * 0.13, 0.4, "sine", 0.1);
    });
    let end = seq.length * 0.13;
    playTone(1046.5, end, 0.5, "triangle", 0.12);
    playTone(1318.52, end, 0.5, "triangle", 0.12);
    playTone(1567.98, end, 0.9, "sine", 0.1);
}

function playLoseWomp() {
    if (soundMode === 2) return;
    playTone(196, 0, 0.45, "sawtooth", 0.12, 130.81);
    playTone(185, 0.1, 0.45, "sawtooth", 0.12, 123.47);
    playTone(196, 0.55, 0.55, "sawtooth", 0.12, 98);
    playTone(185, 0.65, 0.55, "sawtooth", 0.12, 92.5);
    playTone(73.42, 0, 1.1, "triangle", 0.14, 61.74);
}

function playPop() {
    playTone(880, 0, 0.08, "square", 0.045, 440);
}

function playClick() {
    playTone(600, 0, 0.06, "triangle", 0.05, 320);
}

function playCrowd(cheer) {
    let ctx = getAudio();
    if (!ctx || soundMode === 2) return;
    let dur = cheer ? 2.6 : 2.0;
    let buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    let data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    let src = ctx.createBufferSource();
    src.buffer = buffer;
    let filter = ctx.createBiquadFilter();
    let t = ctx.currentTime;
    if (cheer) {
        filter.type = "bandpass";
        filter.Q.value = 0.6;
        filter.frequency.setValueAtTime(900, t);
        filter.frequency.linearRampToValueAtTime(3200, t + dur);
    } else {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(700, t);
        filter.frequency.linearRampToValueAtTime(150, t + dur);
    }
    let g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.07, t + 0.4);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    src.start();
}

/* ── Ambient Music ── */
function startMusic() {
    let ctx = getAudio();
    if (!ctx || musicNodes || soundMode !== 0) return;
    let g = ctx.createGain();
    g.gain.value = 0;
    let freqs = [110, 164.81, 196];
    let oscs = freqs.map(function (f) {
        let o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = f;
        let og = ctx.createGain();
        og.gain.value = 0.16;
        o.connect(og);
        og.connect(g);
        o.start();
        return o;
    });
    let lfo = ctx.createOscillator();
    lfo.frequency.value = 0.1;
    let lfoG = ctx.createGain();
    lfoG.gain.value = 0.05;
    lfo.connect(lfoG);
    lfoG.connect(g.gain);
    lfo.start();
    g.connect(ctx.destination);
    g.gain.linearRampToValueAtTime(tensionLevel ? 0.055 : 0.028, ctx.currentTime + 2);
    musicNodes = { gain: g, oscs: oscs, lfo: lfo };
}

function stopMusic() {
    if (!musicNodes) return;
    let ctx = getAudio();
    let nodes = musicNodes;
    musicNodes = null;
    try {
        nodes.gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
        setTimeout(function () {
            nodes.oscs.forEach(function (o) { try { o.stop(); } catch (e) {} });
            nodes.lfo.stop();
            nodes.gain.disconnect();
        }, 800);
    } catch (e) {}
}

function setTension(on) {
    tensionLevel = on ? 1 : 0;
    if (musicNodes && musicNodes.gain) {
        let target = on ? 0.055 : 0.028;
        musicNodes.gain.gain.linearRampToValueAtTime(target, getAudio().currentTime + 1.5);
    }
}

/* ── Stats ── */
function loadStats() {
    try {
        let s = JSON.parse(localStorage.getItem("stick_stats_v2"));
        if (s && typeof s === "object") {
            return {
                wins: s.wins || 0,
                losses: s.losses || 0,
                games: s.games || 0,
                bestStreak: s.bestStreak || 0,
                roasts: s.roasts || 0
            };
        }
    } catch (e) {}
    return { wins: 0, losses: 0, games: 0, bestStreak: 0, roasts: 0 };
}

function saveStats() {
    try { localStorage.setItem("stick_stats_v2", JSON.stringify(stats)); } catch (e) {}
}

function updateStatsUI() {
    let el = document.getElementById("statsLine");
    if (!el) return;
    el.innerHTML =
        '<span class="chip">🏆 ' + stats.wins + '</span>' +
        '<span class="chip">💀 ' + stats.losses + '</span>' +
        '<span class="chip">🔥 best ' + stats.bestStreak + '</span>' +
        '<span class="chip">🎮 ' + stats.games + '</span>' +
        '<span class="chip">🥧 roasts ' + stats.roasts + '</span>';
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
}

let stats = loadStats();

/* ── Achievements ── */
function unlockAch(id, name, emoji) {
    try {
        let unlocked = JSON.parse(localStorage.getItem("stick_ach_v2") || "{}");
        if (unlocked[id]) return;
        unlocked[id] = true;
        localStorage.setItem("stick_ach_v2", JSON.stringify(unlocked));
    } catch (e) {}
    toastShow(emoji, name, "Achievement unlocked");
}

function toastShow(emoji, title, sub) {
    let box = document.getElementById("achToasts");
    if (!box) {
        box = document.createElement("div");
        box.className = "ach-toasts";
        box.id = "achToasts";
        document.body.appendChild(box);
    }
    let el = document.createElement("div");
    el.className = "ach-toast";
    el.innerHTML = '<span class="ach-emoji">' + emoji + '</span><span><span class="ach-name">' + title + '</span><br><span class="ach-sub">' + (sub || "") + '</span></span>';
    box.appendChild(el);
    setTimeout(function () { el.classList.add("out"); }, 3800);
    setTimeout(function () { el.remove(); }, 4300);
}

function checkWinAchs(firstWin) {
    if (firstWin) unlockAch("firstWin", "First Blood", "🏆");
    if (difficulty === "hard" && firstWin) unlockAch("hardWin", "Brainiac", "🧠");
    [2, 3, 5, 10].forEach(function (n) {
        if (winStreak === n) {
            let d = { 2: ["streak2", "On Fire", "🔥"], 3: ["streak3", "Unstoppable", "⚡"], 5: ["streak5", "Scorching", "🌋"], 10: ["streak10", "Dominator", "👑"] };
            unlockAch(d[n][0], d[n][1], d[n][2]);
        }
    });
    if (stats.games === 10) unlockAch("games10", "Veteran", "🎮");
    if (stats.games === 25) unlockAch("games25", "Marathon Man", "🏃");
}

function checkLoseAchs(lostStreak) {
    if (stats.losses === 1) unlockAch("firstLose", "Welcome to the L Club", "💀");
    if (difficulty === "easy" && stats.losses === 1) unlockAch("loseEasy", "Pity Party", "🫠");
    if (lostStreak >= 3) unlockAch("fallen", "The Fallen", "☠️");
    if (stats.roasts === 10) unlockAch("roast10", "Roast Collector", "🥧");
    if (stats.games === 10) unlockAch("games10", "Veteran", "🎮");
    if (stats.games === 25) unlockAch("games25", "Marathon Man", "🏃");
}

/* ── Load Screen ── */
window.addEventListener("DOMContentLoaded", function () {
    initParticles();

    let soundBtn = document.getElementById("soundToggle");
    if (soundBtn) {
        soundBtn.textContent = soundMode === 0 ? "🔊" : soundMode === 1 ? "🔉" : "🔇";
        soundBtn.addEventListener("click", cycleSound);
    }

    document.addEventListener("click", function (e) {
        if (e.target.closest(".btn")) {
            playClick();
            spawnClickSpark(e.clientX, e.clientY);
        }
    });

    updateStatsUI();
    initSpotlight();

    if (typeof window.playCinematic === "function") {
        window.playCinematic(startLoader);
    } else {
        startLoader();
    }
});

/* ── Loader (starts after the cinematic intro) ── */
function startLoader() {
    let fill = document.getElementById("loaderFill");
    let text = document.getElementById("loaderText");
    let msgs = [
        "Sharpening the sticks...",
        "Teaching the AI to roast...",
        "Warming up the crowd...",
        "Polishing the trash talk...",
        "Almost ready..."
    ];
    let step = 0;

    let iv = setInterval(function () {
        step++;
        let pct = Math.min(step * 16.7, 100);
        fill.style.width = pct + "%";
        if (step <= msgs.length) text.textContent = msgs[step - 1];
        if (pct >= 100) {
            clearInterval(iv);
            setTimeout(function () {
                let titleEl = document.querySelector(".title");
                if (titleEl && !titleEl.dataset.split) {
                    titleEl.dataset.split = "1";
                    titleEl.innerHTML = letterSpans("Stick Game");
                }
                document.getElementById("loadingScreen").classList.add("hidden");
                document.getElementById("gameWrapper").classList.add("visible");
                startMusic();
            }, 400);
        }
    }, 380);
}

/* ── Cursor Spotlight ── */
function initSpotlight() {
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    let spot = document.createElement("div");
    spot.className = "spotlight";
    document.body.appendChild(spot);
    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let x = tx, y = ty;
    document.addEventListener("pointermove", function (e) {
        tx = e.clientX;
        ty = e.clientY;
    });
    (function loop() {
        x += (tx - x) * 0.1;
        y += (ty - y) * 0.1;
        spot.style.transform = "translate3d(" + (x - 320) + "px," + (y - 320) + "px,0)";
        requestAnimationFrame(loop);
    })();
}

function cycleSound() {
    soundMode = (soundMode + 1) % 3;
    let b = document.getElementById("soundToggle");
    b.textContent = soundMode === 0 ? "🔊" : soundMode === 1 ? "🔉" : "🔇";
    try { localStorage.setItem("stick_soundmode", soundMode); } catch (e) {}
    if (soundMode === 0) {
        startMusic();
        playClick();
    } else if (soundMode === 1) {
        stopMusic();
        playClick();
    } else {
        stopMusic();
    }
}

/* ── Particle Canvas ── */
function initParticles() {
    let canvas = document.getElementById("particles");
    let ctx = canvas.getContext("2d");
    let particles = [];
    let count = 60;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 0.5,
            dx: (Math.random() - 0.5) * 0.4,
            dy: (Math.random() - 0.5) * 0.4,
            o: Math.random() * 0.4 + 0.1
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255," + p.o + ")";
            ctx.fill();
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        }
        requestAnimationFrame(draw);
    }
    draw();
}

/* ── Difficulty Picker ── */
function showDifficulty() {
    if (animating) return;
    clearIdle();
    window.currentScreen = "difficulty";
    let box = document.getElementById("gameBox");
    box.style.opacity = "0";
    box.style.transform = "scale(0.95)";

    setTimeout(function () {
        let html = '<button class="nav-back" onclick="openModeSelect()">← Modes</button>';
        html += '<p class="diff-section-title">Choose your challenge</p>';
        html += '<button class="btn diff-btn easy" onclick="showOpponentSelect(\'easy\')">Easy</button> ';
        html += '<button class="btn diff-btn medium" onclick="showOpponentSelect(\'medium\')">Medium</button> ';
        html += '<button class="btn diff-btn hard" onclick="showOpponentSelect(\'hard\')">Hard</button> ';
        html += '<button class="btn diff-btn master" onclick="showOpponentSelect(\'master\')">Master</button>';
        box.innerHTML = html;
        box.style.opacity = "1";
        box.style.transform = "scale(1)";
    }, 250);
}

/* ── Who Goes First Picker ── */
function showWhoGoesFirst(diff) {
    if (animating) return;
    difficulty = diff;
    window.currentScreen = "first";
    let box = document.getElementById("gameBox");
    box.style.opacity = "0";
    box.style.transform = "scale(0.95)";

    setTimeout(function () {
        let html = '<button class="nav-back" onclick="navBack()">← Back</button>';
        html += '<p class="diff-section-title">Who goes first?</p>';
        html += '<button class="btn diff-btn easy" onclick="startGame(\'player\')">You</button> ';
        html += '<button class="btn diff-btn hard" onclick="startGame(\'computer\')">Computer</button> ';
        html += '<button class="btn diff-btn coin" onclick="coinFlipStart()">🪙 Coin Flip</button>';
        box.innerHTML = html;
        box.style.opacity = "1";
        box.style.transform = "scale(1)";
    }, 250);
}

/* ── Start Game ── */
function startGame(first) {
    if (animating) return;
    if (typeof modeDef === "undefined" || !modeDef) modeDef = MODES.classic;
    if (modeDef.chaos) { modeDef.maxTake = 2; modeDef.lastLoses = true; }
    goesFirst = first;
    gameOver = false;
    lastResult = null;
    resetCombo();
    setTension(false);
    stopTurnTimer();

    if (currentMode !== "survival") survivalWave = 1;
    sticks = modeDef.sticks + (modeDef.survival ? (survivalWave - 1) * 4 : 0);

    let box = document.getElementById("gameBox");
    let log = document.getElementById("log");
    log.innerHTML = "";

    box.style.opacity = "0";
    box.style.transform = "scale(0.95)";

    setTimeout(function () {
        playRoundIntro(function () {
            let label = goesFirst === "computer" ? "COMPUTER STARTS" : (modeDef.local ? "PLAYER 1 STARTS" : "YOU START");
            countdown(label, function () { beginTurnFlow(box); });
        });
    }, 250);
}

function beginTurnFlow(box) {
    if (goesFirst === "computer") {
        playersTurn = false;
        localPlayer = 1;
        render(box);
        logMessage("Game started in " + modeDef.name + " mode (" + capitalize(difficulty) + ")!");
        logMessage(sticks + " sticks. Last stick " + (modeDef.lastLoses ? "loses!" : "WINS!"));
        logMessage("Computer goes first!");
        animating = true;
        setTimeout(function () { animating = false; computerTurn(); }, 900);
    } else {
        playersTurn = true;
        localPlayer = 1;
        render(box);
        logMessage("Game started in " + modeDef.name + " mode (" + capitalize(difficulty) + ")!");
        logMessage(sticks + " sticks. Last stick " + (modeDef.lastLoses ? "loses!" : "WINS!"));
        logMessage(modeDef.local ? "Player 1 goes first!" : "You go first!");
        if (modeDef.timed) startTurnTimer(modeDef.timed);
        if (modeDef.chaos) announceChaos();
        setTimeout(watchIdle, 800);
    }
    box.style.opacity = "1";
    box.style.transform = "scale(1)";
}

/* ── Render ── */
function render(box) {
    setTension(sticks > 0 && sticks <= 3);

    let maxTake = modeDef ? modeDef.maxTake : 2;

    let areaClass = "sticks-area" + (sticks > 0 && sticks <= 3 ? " danger" : "") + " skin-" + ((typeof custom !== "undefined" && custom) ? custom.skin : "classic");
    let sticksHtml = '<div class="' + areaClass + '">';
    for (let i = 0; i < sticks; i++) {
        sticksHtml += '<div class="stick" style="animation-delay:' + (i * 0.02) + 's"></div>';
    }
    sticksHtml += "</div>";

    window.currentScreen = "play";
    let surviveTag = modeDef && modeDef.survival ? (modeDef.bossrush ? " · Boss " + (gauntletIndex + 1) + "/3" : " · Wave " + survivalWave) : "";
    let html = '<button class="nav-back in-game" onclick="quitToModes()">← Modes</button>';
    html += '<div class="mode-badge">' + (modeDef ? modeDef.emoji + " " + modeDef.name : "🪵 Classic") + surviveTag + "</div>";
    if (typeof opponentPanelHtml === "function") html += opponentPanelHtml();
    html += '<div class="sticks-count">' + sticks + ' sticks remaining</div>';
    if (typeof powersHtml === "function") html += powersHtml();
    html += sticksHtml;
    if (sticks > 0 && sticks <= 3) {
        html += '<div class="danger-banner">⚠️ ' + sticks + (sticks === 1 ? " stick" : " sticks") + ' left — the danger zone!</div>';
    }
    let info = 'Difficulty: ' + capitalize(difficulty) + ' | ' + (goesFirst === "player" ? "You" : "Computer") + ' goes first';
    if (winStreak > 0) info += ' | 🔥 x' + winStreak;
    html += '<div class="diff-label">' + info + '</div>';

    if (modeDef && modeDef.timed && !gameOver) {
        html += '<div class="turn-timer" id="turnTimer"><span class="tt-num">' + Math.ceil(turnTimeLeft || modeDef.timed) + '</span></div>';
    }

    if (gameOver) {
        let isWin = lastResult === "win";
        let bannerClass = isWin ? "win" : "lose";
        let bannerText = isWin ? "You Win!" : "You Lose!";
        html += '<div class="game-over-banner ' + bannerClass + '">' + bannerText + '</div>';
        html += '<button class="btn btn-glow" onclick="openModeSelect()">Play Again</button>';
    } else if (playersTurn) {
        if (modeDef && modeDef.local) {
            html += '<div class="turn-indicator ' + (localPlayer === 1 ? "p1" : "p2") + '">' + avatarFor(localPlayer) + " Player " + localPlayer + "'s turn</div>";
        }
        html += '<div style="margin-top:16px">';
        for (let t = 1; t <= maxTake; t++) {
            if (sticks >= t) {
                html += '<button class="btn" onclick="take(' + t + ')">Take ' + t + '</button> ';
            }
        }
        html += "</div>";
    } else {
        html += '<div class="thinking"><span></span><span></span><span></span></div>';
    }

    box.innerHTML = html;
    if (box.querySelector(".sticks-area.danger")) fxVignette();
}

/* ── Animate Stick Removal ── */
function animateRemoval(count, callback) {
    let area = document.querySelector(".sticks-area");
    if (!area) { callback(); return; }

    let allSticks = area.querySelectorAll(".stick");
    let toRemove = [];

    for (let i = 0; i < count && i < allSticks.length; i++) {
        toRemove.push(allSticks[allSticks.length - 1 - i]);
    }

    toRemove.forEach(function (s, idx) {
        setTimeout(function () {
            s.classList.add("removing");
            playPop();
            spawnRemovalSpark(s);
        }, idx * 100);
    });

    setTimeout(callback, toRemove.length * 100 + 400);
}

/* ── Player Take ── */
function take(n) {
    if (gameOver || !playersTurn || animating) return;
    if (n > sticks) return;
    if (n > (modeDef ? modeDef.maxTake : 2)) return;
    clearIdle();
    stopTurnTimer();

    animating = true;
    sticks -= n;
    let who = (modeDef && modeDef.local) ? "Player " + localPlayer : "You";
    logMessage(who + " took " + n + " stick" + (n > 1 ? "s" : "") + ". " + sticks + " left.");

    if (sticks > 0 && typeof isPerfectMove === "function" && isPerfectMove(sticks, modeDef ? modeDef.maxTake : 2)) {
        bumpCombo();
    } else {
        resetCombo();
    }
    if (typeof maybeGrantPower === "function") maybeGrantPower();
    if (typeof checkFinalStick === "function") checkFinalStick();

    if (sticks === 0) {
        if (window.playerShield && (modeDef ? modeDef.lastLoses : true)) {
            window.playerShield = false;
            sticks = 1;
            logMessage("🛡️ Your shield absorbed the last stick!");
            if (typeof toastShow === "function") toastShow("🛡️", "Shield used!", "The last stick bounced off");
            let sbox = document.getElementById("gameBox");
            render(sbox);
            animateRemoval(0, function () {
                playersTurn = false;
                render(sbox);
                animating = false;
                setTimeout(computerTurn, 600);
            });
            return;
        }
        gameOver = true;
        let playerLost = modeDef ? modeDef.lastLoses : true;
        let lostStreak = winStreak;
        lastResult = playerLost ? "lose" : "win";
        logMessage(playerLost ? "You took the last stick — you lose!" : "You took the last stick — you WIN!");
        let box = document.getElementById("gameBox");
        render(box);
        animateRemoval(n, function () {
            if (playerLost) {
                showGameOverScreen(false, lostStreak);
                winStreak = 0;
            } else {
                winStreak++;
                showGameOverScreen(true);
            }
            animating = false;
        });
        return;
    }

    animateRemoval(n, function () {
        let box = document.getElementById("gameBox");
        if (modeDef && modeDef.local) {
            localPlayer = localPlayer === 1 ? 2 : 1;
            playersTurn = true;
            render(box);
            if (modeDef.timed) startTurnTimer(modeDef.timed);
            if (modeDef.chaos) announceChaos();
            animating = false;
            return;
        }
        playersTurn = false;
        render(box);
        animating = false;
        setTimeout(computerTurn, 600);
    });
}

/* ── Computer Turn ── */
function computerTurn() {
    if (gameOver || animating) return;
    if (modeDef && modeDef.local) return;

    if (window.oppSkip) {
        window.oppSkip = false;
        playersTurn = true;
        let sbox = document.getElementById("gameBox");
        logMessage("🥷 Steal! The computer's turn is skipped.");
        if (typeof toastShow === "function") toastShow("🥷", "Steal!", "The AI loses its turn");
        render(sbox);
        watchIdle();
        return;
    }

    animating = true;

    let maxTake = modeDef ? modeDef.maxTake : 2;
    let takeAmount;
    if (difficulty === "easy") {
        takeAmount = easyMove(sticks, maxTake);
    } else if (difficulty === "hard") {
        takeAmount = optimalMove(sticks, maxTake);
    } else {
        takeAmount = mediumMove(sticks, maxTake);
    }
    takeAmount = Math.max(1, Math.min(takeAmount, maxTake, sticks));

    let opp = window.currentOpp;
    let frozenNow = !!(window.oppFrozen);
    if (opp) {
        if (window.oppFrozen) {
            window.oppFrozen = false;
            takeAmount = 1 + Math.floor(Math.random() * maxTake);
            logMessage("❄️ The AI is frozen — random move!");
        } else if (opp.clutch && sticks <= maxTake * 3 + 1) {
            takeAmount = optimalMove(sticks, maxTake);
        } else if (opp.blunder && Math.random() < opp.blunder) {
            takeAmount = 1 + Math.floor(Math.random() * maxTake);
        }
        takeAmount = Math.max(1, Math.min(takeAmount, maxTake, sticks));
    }

    /* Master difficulty: flawless, relentless, no blunders */
    if (difficulty === "master" && !frozenNow && !window.oppFrozen) {
        takeAmount = optimalMove(sticks, maxTake);
    }

    sticks -= takeAmount;
    if (typeof checkFinalStick === "function") checkFinalStick();
    logMessage("Computer took " + takeAmount + " stick" + (takeAmount > 1 ? "s" : "") + ". " + sticks + " left.");

    if (sticks === 0) {
        gameOver = true;
        let compLost = modeDef ? modeDef.lastLoses : true;
        lastResult = compLost ? "win" : "lose";
        logMessage(compLost ? "Computer took the last stick — you win!" : "Computer took the last stick — you lose!");
        let box = document.getElementById("gameBox");
        render(box);
        animateRemoval(takeAmount, function () {
            if (compLost) {
                winStreak++;
                showGameOverScreen(true);
            } else {
                let lostStreak = winStreak;
                winStreak = 0;
                showGameOverScreen(false, lostStreak);
            }
            animating = false;
        });
        return;
    }

    animateRemoval(takeAmount, function () {
        playersTurn = true;
        let box = document.getElementById("gameBox");
        render(box);
        animating = false;
        if (modeDef && modeDef.chaos) announceChaos();
        if (modeDef && modeDef.timed) startTurnTimer(modeDef.timed);
        setTimeout(function () {
            if (sticks % (maxTake + 1) === 1 && sticks <= 6 && Math.random() < 0.7) {
                spawnTaunt("Uh oh. My mainframe just sweated. Nice move.");
            } else if (Math.random() < 0.45) {
                spawnTaunt(taunts[Math.floor(Math.random() * taunts.length)]);
            }
            watchIdle();
        }, 1200);
    });
}

/* ── AI Logic (generalized for any max-take / win rule) ── */
function endgameMove(remaining, maxTake, lastLoses) {
    if (lastLoses) return Math.max(1, remaining - 1);
    return Math.max(1, remaining);
}

function easyMove(remaining, maxTake) {
    maxTake = maxTake || 2;
    let lastLoses = modeDef ? modeDef.lastLoses : true;
    if (remaining <= maxTake) return endgameMove(remaining, maxTake, lastLoses);
    return 1 + Math.floor(Math.random() * maxTake);
}

function mediumMove(remaining, maxTake) {
    maxTake = maxTake || 2;
    let lastLoses = modeDef ? modeDef.lastLoses : true;
    if (remaining <= maxTake) return endgameMove(remaining, maxTake, lastLoses);
    if (Math.random() < 0.4) return optimalMove(remaining, maxTake);
    return 1 + Math.floor(Math.random() * maxTake);
}

function optimalMove(remaining, maxTake) {
    maxTake = maxTake || 2;
    let m = maxTake + 1;
    let lastLoses = modeDef ? modeDef.lastLoses : true;
    if (remaining <= maxTake) return endgameMove(remaining, maxTake, lastLoses);
    let r = remaining % m;
    if (lastLoses) {
        if (r === 1) return 1;
        return (r === 0) ? maxTake : r - 1;
    }
    if (r === 0) return 1;
    return r;
}

/* ── Taunts ── */
let tauntCooldownUntil = 0;

function spawnTaunt(msg) {
    if (Date.now() < tauntCooldownUntil) return false;
    tauntCooldownUntil = Date.now() + 2800 + Math.random() * 2000;
    let wrapper = document.querySelector(".game-wrapper");
    if (wrapper) {
        let el = document.createElement("div");
        el.className = "taunt-toast";
        el.textContent = msg;
        wrapper.appendChild(el);
        setTimeout(function () { el.remove(); }, 4300);
    }
    logMessage("🤖 " + msg);
    return true;
}

function clearIdle() {
    if (idleWatcher) { clearInterval(idleWatcher); idleWatcher = null; }
}

let idleWatcher = null;

function watchIdle() {
    clearIdle();
    if (!playersTurn || gameOver) return;
    let turnStartAt = Date.now();
    idleWatcher = setInterval(function () {
        if (!playersTurn || gameOver) { clearIdle(); return; }
        if (Date.now() - turnStartAt > 6000) {
            spawnTaunt(idleTaunts[Math.floor(Math.random() * idleTaunts.length)]);
            turnStartAt = Date.now();
        }
    }, 1000);
}

/* ── Game Over Screen ── */
function showGameOverScreen(isWin, lostStreak) {
    let screen = document.getElementById("gameoverScreen");
    screen.className = "gameover-screen " + (isWin ? "win" : "lose");

    if (typeof cineBars === "function") {
        cineBars(true);
        setTimeout(function () { cineBars(false); }, 1700);
    }
    if (typeof fxShake === "function") fxShake("shake-hard", 500);
    if (typeof fxLightning === "function") fxLightning();

    stats.games++;
    let firstWin = false;
    if (isWin) {
        firstWin = stats.wins === 0;
        stats.wins++;
        if (winStreak > stats.bestStreak) stats.bestStreak = winStreak;
        checkWinAchs(firstWin);
    } else {
        stats.losses++;
        stats.roasts++;
        checkLoseAchs(lostStreak);
    }
    saveStats();
    updateStatsUI();
    if (typeof awardGameXp === "function") awardGameXp(isWin);

    let html = "";
    if (isWin) {
        let isSurvival = modeDef && modeDef.survival;
        let mascot = winMascots[Math.floor(Math.random() * winMascots.length)];
        let sub = winSubs[Math.floor(Math.random() * winSubs.length)];
        html += '<div class="win-stage">';
        html += '<div class="mode-badge" style="margin-bottom:14px">' + (modeDef ? modeDef.emoji + " " + modeDef.name : "🪵 Classic") + (isSurvival ? " · Wave " + survivalWave + " cleared" : "") + "</div>";
        html += '<div class="win-glow-ring"></div>';
        html += '<div class="win-glow-ring ring-late"></div>';
        html += '<div class="win-trophy">' + mascot + '</div>';
        html += '<div class="win-title">' + letterSpans("YOU WIN!") + '</div>';
        html += '<div class="win-subtitle">' + sub + '</div>';
        if (winStreak > 1) {
            html += '<div class="win-streak">🔥 Win Streak: ' + winStreak + ' <span class="best">· Best ' + stats.bestStreak + '</span></div>';
        } else {
            html += '<div class="win-streak">🔥 Best streak: ' + stats.bestStreak + '</div>';
        }
        html += '<div class="go-actions">';
        if (isSurvival) {
            html += '<button class="btn btn-glow gameover-btn" onclick="nextWave()">Next Wave ▶</button>';
        } else {
            html += '<button class="btn btn-glow gameover-btn" onclick="rematch()">🔁 Rematch</button>';
            html += '<button class="btn gameover-btn" onclick="closeGameOver()">Play Again</button>';
        }
        html += '</div>';
        html += '</div>';
    } else {
        let mascot = loseMascots[Math.floor(Math.random() * loseMascots.length)];
        let roast = roastMessages[Math.floor(Math.random() * roastMessages.length)];
        let sting = loseStings[Math.floor(Math.random() * loseStings.length)];
        currentRoast = "'" + roast + "'";
        html += '<div class="lose-stage">';
        html += '<div class="mode-badge" style="margin-bottom:14px">' + (modeDef ? modeDef.emoji + " " + modeDef.name : "🪵 Classic") + "</div>";
        html += '<div class="stamp rekt">REKT</div>';
        html += '<div class="lose-watermark">L</div>';
        html += '<div class="lose-mascot">' + mascot + '</div>';
        html += '<div class="lose-title-wrap"><div class="lose-title">' + letterSpans("YOU LOSE!") + '</div><div class="lose-glare"></div></div>';
        html += '<div class="lose-roast" id="roastText"></div>';
        html += '<div class="lose-sting">' + sting + '</div>';
        html += '<div class="roast-actions">';
        html += '<button class="btn btn-mini" onclick="copyRoast()">📋 Copy roast</button>';
        html += '<button class="btn btn-mini" onclick="rerollRoast()">🎲 Roast me again</button>';
        html += '</div>';
        if (lostStreak > 0) {
            html += '<div class="lose-streak">💀 Streak of <strong>' + lostStreak + '</strong> destroyed</div>';
        }
        html += '<div class="go-actions">';
        html += '<button class="btn btn-glow gameover-btn" onclick="rematch()">🔁 Rematch</button>';
        html += '<button class="btn gameover-btn" onclick="closeGameOver()">Try Again</button>';
        html += '</div>';
        html += '</div>';
    }

    screen.innerHTML = html;

    requestAnimationFrame(function () {
        screen.classList.add("active");
    });

    if (isWin) {
        screenFlash("win");
        setTimeout(playWinFanfare, 50);
        setTimeout(function () { playCrowd(true); }, 250);
        spawnConfetti();
        if (typeof spawnFireworks === "function") spawnFireworks(5);
    } else {
        screenFlash("lose");
        screen.classList.add("lose-shake");
        setTimeout(playLoseWomp, 50);
        setTimeout(function () { playCrowd(false); }, 250);
        spawnLoserRain();
        let roastEl = screen.querySelector(".lose-roast");
        setTimeout(function () {
            typeRoast(roastEl, currentRoast);
        }, 1100);
    }
}

function closeGameOver() {
    let screen = document.getElementById("gameoverScreen");
    screen.classList.remove("active");
    screen.innerHTML = "";
    stopTurnTimer();
    resetCombo();
    openModeSelect();
}

function copyRoast() {
    if (!currentRoast) return;
    let done = function () {
        toastShow("📋", "Roast copied!", "Go on, spread the shame");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(currentRoast).then(done).catch(done);
    } else {
        done();
    }
}

function rerollRoast() {
    currentRoast = "'" + roastMessages[Math.floor(Math.random() * roastMessages.length)] + "'";
    let el = document.getElementById("roastText");
    if (el) typeRoast(el, currentRoast);
}

/* ── Confetti / Firework Show ── */
function spawnConfetti() {
    let colors = ["#50c878", "#ff6ec7", "#1e90ff", "#ffd700", "#e040a0", "#ffffff", "#ff9a3c"];
    let shapes = ["rect", "circle", "star", "triangle"];
    for (let i = 0; i < 90; i++) {
        let el = document.createElement("div");
        let shape = shapes[Math.floor(Math.random() * shapes.length)];
        el.className = "confetti " + shape;
        el.style.left = Math.random() * 100 + "vw";
        el.style.top = -10 + "px";
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.width = (Math.random() * 10 + 6) + "px";
        el.style.height = (Math.random() * 10 + 6) + "px";
        el.style.animationDuration = (Math.random() * 2.2 + 1.8) + "s";
        el.style.animationDelay = (Math.random() * 1.4) + "s";
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 5000);
    }
    for (let b = 0; b < 5; b++) {
        setTimeout(function () {
            confettiBurst();
        }, 250 + b * 420);
    }
    for (let c = 0; c < 3; c++) {
        setTimeout(function () {
            coinShower();
        }, 500 + c * 800);
    }
}

function coinShower() {
    let coins = ["🪙", "✨", "⭐", "🌠"];
    for (let i = 0; i < 12; i++) {
        let el = document.createElement("div");
        el.className = "loser-rain win-coin";
        el.textContent = coins[Math.floor(Math.random() * coins.length)];
        el.style.left = Math.random() * 100 + "vw";
        el.style.fontSize = (Math.random() * 18 + 20) + "px";
        el.style.animationDuration = (Math.random() * 2 + 2.5) + "s";
        el.style.setProperty("--drift", (Math.random() * 200 - 100) + "px");
        el.style.setProperty("--spin", (Math.random() * 720 + 360) + "deg");
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 6000);
    }
}

function confettiBurst() {
    let colors = ["#ffd700", "#50c878", "#ff6ec7", "#1e90ff", "#ffffff"];
    for (let i = 0; i < 18; i++) {
        let el = document.createElement("div");
        let shape = Math.random() < 0.4 ? "star" : "rect";
        el.className = "confetti burst " + shape;
        el.style.left = (Math.random() * 90 + 5) + "vw";
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.width = (Math.random() * 8 + 5) + "px";
        el.style.height = (Math.random() * 8 + 5) + "px";
        el.style.setProperty("--dx", (Math.random() * 360 - 180) + "px");
        el.style.setProperty("--dy", (-Math.random() * 50 - 55) + "vh");
        el.style.setProperty("--rot", (Math.random() * 720 + 360) + "deg");
        el.style.animationDuration = (Math.random() * 0.8 + 1) + "s";
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 2300);
    }
}

function spawnRemovalSpark(stick) {
    let rect = stick.getBoundingClientRect();
    let colors = ["#ffd700", "#ff6ec7", "#50c878"];
    for (let i = 0; i < 5; i++) {
        let el = document.createElement("div");
        el.className = "spark";
        el.style.left = (rect.left + rect.width / 2) + "px";
        el.style.top = (rect.top + rect.height / 2) + "px";
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.setProperty("--dx", (Math.random() * 80 - 40) + "px");
        el.style.setProperty("--dy", (Math.random() * 60 - 30) + "px");
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 600);
    }
}

function spawnClickSpark(x, y) {
    let colors = ["#ffd700", "#ff6ec7", "#50c878", "#9bd1ff"];
    for (let i = 0; i < 3; i++) {
        let el = document.createElement("div");
        el.className = "spark";
        el.style.left = (x + (Math.random() * 10 - 5)) + "px";
        el.style.top = (y + (Math.random() * 10 - 5)) + "px";
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.setProperty("--dx", (Math.random() * 46 - 23) + "px");
        el.style.setProperty("--dy", (Math.random() * 40 - 20) + "px");
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 600);
    }
}

function spawnLoserRain() {
    let items = ["🤡", "L", "🍅", "💀", "🗿", "🥴"];
    for (let i = 0; i < 45; i++) {
        let el = document.createElement("div");
        el.className = "loser-rain";
        el.textContent = items[Math.floor(Math.random() * items.length)];
        el.style.left = Math.random() * 100 + "vw";
        el.style.fontSize = (Math.random() * 24 + 20) + "px";
        el.style.animationDuration = (Math.random() * 2.5 + 3) + "s";
        el.style.animationDelay = (Math.random() * 2) + "s";
        el.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
        el.style.setProperty("--spin", (Math.random() * 540 + 180) + "deg");
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 7500);
    }
}

/* ── Text Effects ── */
function letterSpans(text) {
    let html = "";
    for (let i = 0; i < text.length; i++) {
        let ch = text[i] === " " ? "&nbsp;" : text[i];
        html += '<span class="letter" style="animation-delay:' + (i * 0.055 + 0.15).toFixed(3) + 's">' + ch + "</span>";
    }
    return html;
}

function typeRoast(el, text) {
    if (!el) return;
    el.textContent = "";
    let i = 0;
    let iv = setInterval(function () {
        el.textContent = text.slice(0, i + 1);
        i++;
        if (i >= text.length) clearInterval(iv);
    }, 26);
}

/* ── Utilities ── */
function logMessage(msg) {
    let log = document.getElementById("log");
    let p = document.createElement("p");
    p.textContent = msg;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function screenFlash(type) {
    let el = document.createElement("div");
    el.className = "screen-flash " + type;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 700);
}