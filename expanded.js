/* ═══════════════════════════════════════════════════════════
   STICK GAME — EXPANSION PACK
   Game modes · Customization · Weather · Combos · Timer
   Cinematics · Dynamic FX · Sound pack
   ═══════════════════════════════════════════════════════════ */
"use strict";

/* ── Shared state (global lexical via window) ── */
window.MODES = {
    classic:  { name: "Classic",     emoji: "🪵", sticks: 21, maxTake: 2, lastLoses: true,  desc: "The original 21-stick duel." },
    mayhem:   { name: "Mayhem",      emoji: "💥", sticks: 25, maxTake: 3, lastLoses: true,  desc: "Take 1–3. Bigger pile, bigger risk." },
    sudden:   { name: "Sudden Death", emoji: "☠️", sticks: 11, maxTake: 2, lastLoses: true,  desc: "Fewer sticks. Zero margin for error." },
    blitz:    { name: "Blitz",       emoji: "⚡", sticks: 15, maxTake: 2, lastLoses: true,  timed: 6, desc: "Only 6 seconds per turn. Think fast!" },
    chaos:    { name: "Chaos",       emoji: "🎲", sticks: 21, maxTake: 2, lastLoses: true,  chaos: true, desc: "The rules mutate. Every. Single. Turn." },
    reverse:  { name: "Reverse",     emoji: "🔄", sticks: 21, maxTake: 2, lastLoses: false, desc: "Whoever takes the last stick WINS." },
    marathon: { name: "Marathon",    emoji: "🏃", sticks: 41, maxTake: 2, lastLoses: true,  desc: "41 sticks. An endurance test." },
    survival: { name: "Survival",    emoji: "🧟", sticks: 9,  maxTake: 2, lastLoses: true,  survival: true, desc: "Waves grow. The AI gets sharper." },
    local:    { name: "2 Players",   emoji: "👥", sticks: 21, maxTake: 2, lastLoses: true,  local: true, desc: "Pass & play. Loser buys snacks." }
};

window.currentMode = "classic";
window.modeDef = window.MODES.classic;
window.localPlayer = 1;
window.survivalWave = 1;
window.comboCount = 0;

/* ── Customization ── */
window.custom = loadCustom();

function loadCustom() {
    var d = {
        theme: "neon",
        skin: "classic",
        avatar: "🎮",
        name: "Player",
        weather: "auto",
        trail: true,
        scanlines: true,
        sfx: true
    };
    try {
        var s = JSON.parse(localStorage.getItem("stick_custom_v1"));
        if (s && typeof s === "object") {
            for (var k in d) if (s[k] !== undefined) d[k] = s[k];
        }
    } catch (e) {}
    return d;
}

function saveCustom() {
    try { localStorage.setItem("stick_custom_v1", JSON.stringify(custom)); } catch (e) {}
}

var THEMES = {
    neon:   { name: "Neon",   c1: "#e040a0", c2: "#6c3ce0", c3: "#1e90ff" },
    sunset: { name: "Sunset", c1: "#ff7a3c", c2: "#ff3c7a", c3: "#ffb03c" },
    ocean:  { name: "Ocean",  c1: "#22d3ee", c2: "#3b82f6", c3: "#0ea5e9" },
    forest: { name: "Forest", c1: "#34d399", c2: "#10b981", c3: "#a3e635" },
    candy:  { name: "Candy",  c1: "#ff6ec7", c2: "#a78bfa", c3: "#67e8f9" },
    matrix: { name: "Matrix", c1: "#22c55e", c2: "#16a34a", c3: "#4ade80" },
    mono:   { name: "Mono",   c1: "#e5e7eb", c2: "#9ca3af", c3: "#ffffff" },
    blood:  { name: "Blood",  c1: "#ef4444", c2: "#991b1b", c3: "#f97316" },
    aurora: { name: "Aurora", c1: "#7c3aed", c2: "#06b6d4", c3: "#ec4899" }
};

var SKINS = {
    classic: "Classic", gold: "Gold", ice: "Ice", lava: "Lava",
    wood: "Wood", ghost: "Ghost", rainbow: "Rainbow"
};

var AVATARS = ["🎮", "👤", "🤖", "🐱", "🦊", "🐸", "👑", "💀", "🚀", "🍀", "🔥", "⚡", "🌸", "🐉", "🦄", "🥷"];

var WEATHERS = ["auto", "none", "stars", "snow", "embers", "rain", "matrix", "bubbles", "leaves", "confetti"];

var THEME_WEATHER = {
    neon: "stars", sunset: "embers", ocean: "bubbles", forest: "leaves",
    candy: "confetti", matrix: "matrix", mono: "snow", blood: "embers", aurora: "stars"
};

function resolvedWeather() {
    if (!custom) return "stars";
    if (custom.weather && custom.weather !== "auto") return custom.weather;
    return THEME_WEATHER[custom.theme] || "stars";
}

function applyCustom() {
    document.body.setAttribute("data-theme", custom.theme || "neon");
    document.body.setAttribute("data-skin", custom.skin || "classic");
    document.body.classList.toggle("no-scanlines", !custom.scanlines);
    document.body.classList.toggle("no-trail", !custom.trail);
    setWeather(resolvedWeather());
}

/* ═══ SOUND PACK (uses sticks.js audio helpers) ═══ */
function expTone(freq, start, dur, type, vol, slideTo) {
    if (!custom || custom.sfx === false) return;
    if (typeof playTone === "function") {
        try { playTone(freq, start, dur, type, vol, slideTo); } catch (e) {}
    }
}
function sfxCombo(n) {
    var base = 520 + Math.min(n, 8) * 70;
    expTone(base, 0, 0.16, "triangle", 0.12);
    expTone(base * 1.5, 0.06, 0.22, "sine", 0.09);
}
function sfxTick() { expTone(1200, 0, 0.05, "square", 0.05, 900); }
function sfxWhoosh() { expTone(200, 0, 0.5, "sawtooth", 0.08, 1400); }
function sfxChaos() {
    expTone(180, 0, 0.4, "square", 0.1, 900);
    expTone(660, 0.1, 0.3, "triangle", 0.09, 220);
}
function sfxHover() { expTone(700, 0, 0.05, "sine", 0.03); }
function sfxWin2() {
    var seq = [659.25, 783.99, 987.77, 1318.51];
    seq.forEach(function (f, i) { expTone(f, i * 0.11, 0.3, "triangle", 0.14); });
}
function sfxCountdown(final) {
    if (final) { expTone(880, 0, 0.4, "triangle", 0.16); expTone(1320, 0, 0.5, "sine", 0.1); }
    else expTone(440, 0, 0.16, "triangle", 0.12);
}

/* ═══ WEATHER ENGINE ═══ */
var weatherTimer = null;

function setWeather(type) {
    var box = document.getElementById("weather");
    if (!box) return;
    box.innerHTML = "";
    if (weatherTimer) { clearInterval(weatherTimer); weatherTimer = null; }
    document.body.setAttribute("data-weather", type || "none");
    if (!type || type === "none") return;
    spawnWeatherBatch(box);
    weatherTimer = setInterval(function () { spawnWeatherBatch(box); }, 1300);
}

function spawnWeatherBatch(box) {
    var type = document.body.getAttribute("data-weather");
    var n = type === "matrix" ? 5 : type === "rain" ? 8 : 4;
    for (var i = 0; i < n; i++) spawnWeatherParticle(box, type);
}

function spawnWeatherParticle(box, type) {
    if (!box) return;
    var el = document.createElement("div");
    el.className = "wp";
    var dur = 7 + Math.random() * 7;
    el.style.left = Math.random() * 100 + "vw";
    el.style.animationDuration = dur + "s";
    el.style.animationDelay = (-Math.random() * dur) + "s";
    el.style.setProperty("--sway", (Math.random() * 120 - 60) + "px");
    el.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");

    if (type === "stars") {
        el.className += " wp-star";
        el.textContent = "✦";
        el.style.fontSize = (Math.random() * 8 + 6) + "px";
        el.style.opacity = 0.25 + Math.random() * 0.5;
    } else if (type === "snow") {
        el.className += " wp-snow";
        var s = Math.random() * 6 + 3;
        el.style.width = s + "px";
        el.style.height = s + "px";
    } else if (type === "embers") {
        el.className += " wp-ember";
        el.style.setProperty("--sway", (Math.random() * 60 - 30) + "px");
    } else if (type === "rain") {
        el.className += " wp-rain";
        el.style.setProperty("--sway", "0px");
        el.style.setProperty("--rot", "0deg");
    } else if (type === "matrix") {
        el.className += " wp-matrix";
        el.textContent = String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96));
        el.style.fontSize = (Math.random() * 8 + 12) + "px";
    } else if (type === "bubbles") {
        el.className += " wp-bubble";
        var b = Math.random() * 24 + 8;
        el.style.width = b + "px";
        el.style.height = b + "px";
        el.style.animationDirection = "reverse";
    } else if (type === "leaves") {
        el.className += " wp-leaf";
        el.textContent = "🍃";
    } else if (type === "confetti") {
        el.className += " wp-confetti";
        el.style.background = ["#ff5f6d", "#ffc371", "#47cf73", "#4facfe", "#b06ab3", "#ffd700"][Math.floor(Math.random() * 6)];
    }
    box.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, (dur + 2) * 1000);
}

/* ═══ CURSOR TRAIL ═══ */
function initTrail() {
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    var last = 0;
    document.addEventListener("pointermove", function (e) {
        if (!custom.trail) return;
        var now = Date.now();
        if (now - last < 40) return;
        last = now;
        var layer = document.getElementById("cursorTrail");
        if (!layer) return;
        var d = document.createElement("div");
        d.className = "trail-dot";
        d.style.left = e.clientX + "px";
        d.style.top = e.clientY + "px";
        d.style.background = "radial-gradient(circle, var(--accent3), var(--accent))";
        layer.appendChild(d);
        setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 620);
    });
}

/* ═══ COMBO SYSTEM ═══ */
function isPerfectMove(remaining, maxTake) {
    return remaining > 0 && (remaining % (maxTake + 1)) === 1;
}

function comboLabel(n) {
    if (n < 2) return "";
    if (n === 2) return "NICE";
    if (n === 3) return "GREAT";
    if (n === 4) return "PERFECT";
    if (n === 5) return "AMAZING";
    if (n === 6) return "INCREDIBLE";
    if (n === 7) return "UNREAL";
    return "GODLIKE";
}

function bumpCombo() {
    comboCount++;
    if (comboCount >= 2) showCombo(comboCount);
    if (comboCount >= 3) {
        sfxCombo(comboCount);
        fxChroma();
    }
    if (comboCount >= 5) fxShake("shake-hard", 240);
    return comboCount;
}

function resetCombo() { comboCount = 0; }

function showCombo(n) {
    var layer = document.getElementById("comboLayer");
    if (!layer) return;
    var el = document.createElement("div");
    el.className = "combo-pop";
    el.innerHTML = comboLabel(n) + '<span class="combo-num">COMBO x' + n + '</span>';
    layer.appendChild(el);
    spawnFxImpact(window.innerWidth * 0.82, window.innerHeight * 0.34, cvar("--accent"));
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1050);
}

function cvar(name) {
    try {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#e040a0";
    } catch (e) { return "#e040a0"; }
}

/* ── Player identity helpers ── */
function avatarFor(p) {
    if (p === 1) return (custom && custom.avatar) ? custom.avatar : "🎮";
    return "🦊";
}

/* ── Survival: advance to the next wave ── */
function nextWave() {
    var screen = document.getElementById("gameoverScreen");
    if (screen) { screen.classList.remove("active"); screen.innerHTML = ""; }
    survivalWave++;
    difficulty = survivalWave >= 4 ? "hard" : survivalWave >= 2 ? "medium" : "easy";
    if (typeof startGame === "function") {
        startGame(typeof goesFirst !== "undefined" ? goesFirst : "player");
    }
}

/* ═══ DYNAMIC FX ═══ */
function fxShake(cls, ms) {
    cls = cls || "shake-hard";
    document.body.classList.remove(cls);
    void document.body.offsetWidth;
    document.body.classList.add(cls);
    setTimeout(function () { document.body.classList.remove(cls); }, ms || 520);
}

function fxLightning() {
    var el = document.createElement("div");
    el.className = "fx-lightning";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 600);
}

function fxChroma() {
    var layer = document.getElementById("fxLayer");
    if (!layer) return;
    var el = document.createElement("div");
    el.className = "fx-chroma";
    layer.appendChild(el);
    setTimeout(function () { el.remove(); }, 500);
}

function fxVignette() {
    var el = document.createElement("div");
    el.className = "fx-vignette-pulse";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 750);
}

function spawnFxImpact(x, y, color) {
    var el = document.createElement("div");
    el.className = "fx-impact";
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.borderColor = color || "#fff";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 750);
}

function cineBars(on) {
    var tops = document.querySelectorAll(".fx-cinebar.top");
    var bots = document.querySelectorAll(".fx-cinebar.bottom");
    if (tops.length === 0) {
        ["top", "bottom"].forEach(function (pos) {
            var b = document.createElement("div");
            b.className = "fx-cinebar " + pos;
            document.body.appendChild(b);
        });
        tops = document.querySelectorAll(".fx-cinebar.top");
        bots = document.querySelectorAll(".fx-cinebar.bottom");
    }
    tops.forEach(function (b) { b.classList.toggle("show", on); });
    bots.forEach(function (b) { b.classList.toggle("show", on); });
}

/* ═══ MODE SELECT ═══ */
function openModeSelect() {
    if (typeof animating !== "undefined" && animating) return;
    if (typeof clearIdle === "function") clearIdle();
    window.currentScreen = "modes";
    var box = document.getElementById("gameBox");
    if (!box) return;
    box.style.opacity = "0";
    box.style.transform = "scale(0.95)";
    setTimeout(function () {
        var html = '<button class="nav-back" onclick="showStartScreen()">← Back</button>';
        html += '<button class="surprise-btn" onclick="surpriseMe()"><span class="sp-emoji">🎲</span> Surprise Me</button>';
        html += '<p class="diff-section-title">Choose a game mode</p>';
        html += '<div class="mode-grid">';
        Object.keys(MODES).forEach(function (id, i) {
            var m = MODES[id];
            html += '<button class="mode-card" data-mode="' + id + '" style="animation-delay:' + (i * 0.04) + 's" onclick="chooseMode(\'' + id + '\')">' +
                '<span class="mode-emoji">' + m.emoji + '</span>' +
                '<span class="mode-name">' + m.name + '</span>' +
                '<span class="mode-desc">' + m.desc + '</span></button>';
        });
        html += "</div>";
        box.innerHTML = html;
        box.style.opacity = "1";
        box.style.transform = "scale(1)";
    }, 250);
}

function chooseMode(id) {
    currentMode = id;
    modeDef = MODES[id];
    sfxHover();
    if (modeDef.local) {
        difficulty = "human";
        goesFirst = "player";
        startGame("player");
    } else {
        showDifficulty();
    }
}

/* ═══ ROUND INTRO CINEMATIC ═══ */
function playRoundIntro(cb) {
    var rc = document.getElementById("roundCine");
    if (!rc) { cb(); return; }
    var m = modeDef || MODES.classic;
    var kick = document.getElementById("rcKicker");
    var title = document.getElementById("rcTitle");
    var desc = document.getElementById("rcDesc");
    if (kick) kick.textContent = "Now Playing";
    if (title) title.textContent = m.name;
    if (desc) desc.textContent = m.desc || "";
    rc.classList.add("on");
    sfxWhoosh();
    fxShake("shake-hard", 400);
    setTimeout(function () { rc.classList.add("out"); }, 1500);
    setTimeout(function () {
        rc.classList.remove("on", "out");
        rc.style.opacity = "";
        cb();
    }, 2050);
}

/* ═══ COUNTDOWN CINEMATIC ═══ */
function countdown(label, cb) {
    var cine = document.getElementById("countdownCine");
    if (!cine) { cb(); return; }
    var num = document.getElementById("cdNum");
    var lab = document.getElementById("cdLabel");
    if (lab) lab.textContent = label || "GET READY";
    var n = 3;
    function step() {
        if (n > 0) {
            if (num) {
                num.textContent = n;
                num.style.animation = "none";
                void num.offsetWidth;
                num.style.animation = "";
            }
            cine.classList.remove("tick");
            void cine.offsetWidth;
            cine.classList.add("tick");
            sfxCountdown(false);
            n--;
            setTimeout(step, 550);
        } else {
            if (num) num.textContent = "GO";
            sfxCountdown(true);
            cine.classList.remove("tick");
            void cine.offsetWidth;
            cine.classList.add("tick");
            fxChroma();
            setTimeout(function () {
                cine.classList.remove("on", "tick");
                cb();
            }, 520);
        }
    }
    cine.classList.add("on");
    step();
}

/* ═══ TURN TIMER (Blitz) ═══ */
var turnTimerIv = null;
var turnTimeLeft = 0;
var lastTickSec = null;

function startTurnTimer(seconds) {
    stopTurnTimer();
    turnTimeLeft = seconds;
    lastTickSec = null;
    updateTimerUI();
    var last = Date.now();
    turnTimerIv = setInterval(function () {
        var now = Date.now();
        turnTimeLeft -= (now - last) / 1000;
        last = now;
        updateTimerUI();
        var sec = Math.ceil(turnTimeLeft);
        if (sec <= 3 && sec >= 1 && sec !== lastTickSec) { lastTickSec = sec; sfxTick(); }
        if (turnTimeLeft <= 0) {
            stopTurnTimer();
            timeOut();
        }
    }, 100);
}

function stopTurnTimer() {
    if (turnTimerIv) { clearInterval(turnTimerIv); turnTimerIv = null; }
    lastTickSec = null;
}

function updateTimerUI() {
    var el = document.getElementById("turnTimer");
    if (!el) return;
    var total = (modeDef && modeDef.timed) ? modeDef.timed : 6;
    var pct = Math.max(0, Math.min(100, (turnTimeLeft / total) * 100));
    el.style.setProperty("--p", pct + "%");
    el.classList.toggle("low", turnTimeLeft <= 3);
    var n = el.querySelector(".tt-num");
    if (n) n.textContent = Math.max(0, Math.ceil(turnTimeLeft));
}

function timeOut() {
    if (typeof gameOver === "undefined" || gameOver || animating) return;
    var amt = Math.min(modeDef ? modeDef.maxTake : 2, sticks);
    spawnTaunt("⏰ Time's up! I'll take " + amt + " for you.");
    take(amt);
}

/* ═══ CHAOS MODE ═══ */
var chaosPrev = null;
function announceChaos() {
    if (!modeDef || !modeDef.chaos) return;
    var roll = Math.random();
    modeDef.maxTake = roll < 0.45 ? 3 : 2;
    modeDef.lastLoses = !(roll > 0.82);
    var msg;
    if (modeDef.maxTake === 3 && !modeDef.lastLoses) msg = "🎲 CHAOS: take up to 3 — and the LAST stick WINS!";
    else if (modeDef.maxTake === 3) msg = "🎲 CHAOS: you may now take up to 3 sticks!";
    else if (!modeDef.lastLoses) msg = "🎲 CHAOS: rule flip — taking the last stick WINS!";
    else msg = "🎲 CHAOS: back to normal — take 1 or 2.";
    if (typeof tauntCooldownUntil !== "undefined") { try { tauntCooldownUntil = 0; } catch (e) {} }
    spawnTaunt(msg);
    sfxChaos();
    fxLightning();
    fxShake("shake-hard", 500);
}

/* ═══ MODALS ═══ */
function openModal(id) {
    var m = document.getElementById(id);
    if (m) m.classList.add("open");
    sfxHover();
}
function closeModal(id) {
    var m = document.getElementById(id);
    if (m) m.classList.remove("open");
}

function openSettings() {
    buildSettings();
    openModal("settingsModal");
}
function closeSettings() { closeModal("settingsModal"); saveCustom(); applyCustom(); }

function buildSettings() {
    var body = document.getElementById("settingsBody");
    if (!body) return;
    var html = "";

    html += '<div class="set-section"><div class="set-label">Player name</div>';
    html += '<input class="name-input" id="playerNameInput" maxlength="16" value="' + escapeAttr(custom.name) + '" oninput="saveName(this.value)" placeholder="Enter your name"></div>';

    html += '<div class="set-section"><div class="set-label">Avatar</div><div class="set-swatches">';
    AVATARS.forEach(function (a) {
        html += '<button class="swatch" style="background:rgba(255,255,255,.06);font-size:1.4rem;display:flex;align-items:center;justify-content:center" data-avatar="' + a + '" onclick="setAvatar(\'' + a + '\')">' + a + "</button>";
    });
    html += "</div></div>";

    html += '<div class="set-section"><div class="set-label">Theme</div><div class="set-swatches">';
    Object.keys(THEMES).forEach(function (id) {
        var t = THEMES[id];
        html += '<button class="swatch" title="' + t.name + '" data-theme="' + id + '" style="background:linear-gradient(135deg,' + t.c1 + ',' + t.c2 + ' 55%,' + t.c3 + ')" onclick="setTheme(\'' + id + '\')"></button>';
    });
    html += "</div></div>";

    html += '<div class="set-section"><div class="set-label">Stick skin</div><div class="chip-row">';
    Object.keys(SKINS).forEach(function (id) {
        html += '<button class="opt-chip" data-skinopt="' + id + '" onclick="setSkin(\'' + id + '\')">' + SKINS[id] + "</button>";
    });
    html += "</div></div>";

    html += '<div class="set-section"><div class="set-label">Weather / particles</div><div class="chip-row">';
    WEATHERS.forEach(function (w) {
        html += '<button class="opt-chip" data-weatheropt="' + w + '" onclick="setWeatherManual(\'' + w + '\')">' + capitalizeStr(w) + "</button>";
    });
    html += "</div></div>";

    html += '<div class="set-section"><div class="set-label">Preferences</div>';
    html += toggleRow("Cursor trail", "trail");
    html += toggleRow("Film grain / scanlines", "scanlines");
    html += toggleRow("Sound effects", "sfx");
    html += "</div>";

    html += '<div class="set-section"><button class="btn btn-mini" onclick="resetProgress()">🗑️ Reset all progress</button></div>';

    body.innerHTML = html;
    refreshSettingsActive();
}

function toggleRow(label, key) {
    var on = custom[key] !== false ? " on" : "";
    return '<div class="switch-row"><span>' + label + '</span><button class="switch' + on + '" id="sw_' + key + '" onclick="togglePref(\'' + key + '\')"></button></div>';
}

function refreshSettingsActive() {
    document.querySelectorAll("[data-theme]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-theme") === custom.theme);
    });
    document.querySelectorAll("[data-avatar]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-avatar") === custom.avatar);
    });
    document.querySelectorAll("[data-skinopt]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-skinopt") === custom.skin);
    });
    document.querySelectorAll("[data-weatheropt]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-weatheropt") === custom.weather);
    });
}

function setTheme(id) {
    custom.theme = id;
    saveCustom(); applyCustom(); refreshSettingsActive();
    sfxHover();
}
function setAvatar(a) {
    custom.avatar = a;
    saveCustom(); refreshSettingsActive();
    sfxHover();
}
function setSkin(id) {
    custom.skin = id;
    saveCustom(); applyCustom(); refreshSettingsActive();
    sfxHover();
}
function setWeatherManual(w) {
    custom.weather = w;
    saveCustom(); applyCustom(); refreshSettingsActive();
    sfxHover();
}
function saveName(v) {
    custom.name = (v || "").slice(0, 16) || "Player";
    saveCustom();
}
function togglePref(key) {
    custom[key] = custom[key] === false ? true : false;
    saveCustom();
    var sw = document.getElementById("sw_" + key);
    if (sw) sw.classList.toggle("on", custom[key] !== false);
    if (key === "trail") document.body.classList.toggle("no-trail", !custom.trail);
    if (key === "scanlines") document.body.classList.toggle("no-scanlines", !custom.scanlines);
    sfxHover();
}
function resetProgress() {
    try {
        ["stick_stats_v2", "stick_ach_v2", "stick_progress_v1", "stick_roasts_v1", "stick_opponent"].forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
    if (typeof progress !== "undefined" && progress) {
        progress.xp = 0; progress.level = 1; progress.lb = [];
        if (typeof saveProgress === "function") saveProgress();
        if (typeof updateLevelBadge === "function") updateLevelBadge();
    }
    if (typeof customRoasts !== "undefined") customRoasts.length = 0;
    if (typeof stats !== "undefined") { stats = { wins: 0, losses: 0, games: 0, bestStreak: 0, roasts: 0 }; if (typeof saveStats === "function") saveStats(); }
    if (typeof updateStatsUI === "function") updateStatsUI();
    if (typeof toastShow === "function") toastShow("🗑️", "Progress reset", "A clean slate!");
    closeSettings();
}

function escapeAttr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function capitalizeStr(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ── Achievements modal ── */
function openAch() {
    buildAch();
    openModal("achModal");
}
function closeAch() { closeModal("achModal"); }

function buildAch() {
    var grid = document.getElementById("achGrid");
    var prog = document.getElementById("achProgress");
    if (!grid || typeof achDefs === "undefined") return;
    var unlocked = {};
    try { unlocked = JSON.parse(localStorage.getItem("stick_ach_v2") || "{}"); } catch (e) {}
    var count = 0;
    var html = "";
    achDefs.forEach(function (a) {
        var got = !!unlocked[a.id];
        if (got) count++;
        html += '<div class="ach-item ' + (got ? "unlocked" : "locked") + '">' +
            '<span class="ach-emoji">' + a.emoji + '</span>' +
            '<span class="ach-info"><span class="ach-t">' + a.name + '</span><br>' +
            '<span class="ach-s">' + (got ? "Unlocked" : "Locked") + "</span></span></div>";
    });
    grid.innerHTML = html;
    if (prog) prog.textContent = count + " / " + achDefs.length + " unlocked";
}

/* ── Stats modal ── */
function openStats() {
    buildStats();
    openModal("statsModal");
}
function closeStats() { closeModal("statsModal"); }

function buildStats() {
    var body = document.getElementById("statsBody");
    if (!body || typeof stats === "undefined") return;
    var total = stats.games || 1;
    var wr = Math.round((stats.wins / total) * 100);
    var html = '<div class="stat-grid">';
    html += statBox(stats.games, "Games played");
    html += statBox(stats.wins, "Wins");
    html += statBox(stats.losses, "Losses");
    html += statBox(wr + "%", "Win rate");
    html += statBox(stats.bestStreak, "Best streak");
    html += statBox(stats.roasts, "Roasts");
    html += "</div>";
    body.innerHTML = html;
}
function statBox(num, lab) {
    return '<div class="stat-box"><div class="sb-num">' + num + '</div><div class="sb-lab">' + lab + '</div></div>';
}

/* ═══ KEYBOARD SHORTCUTS ═══ */
function initKeys() {
    document.addEventListener("keydown", function (e) {
        if (document.body.classList.contains("cine-on")) return;
        var tag = (e.target && e.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA") {
            if (e.key === "Escape") e.target.blur();
            return;
        }
        if (document.querySelector(".modal.open")) {
            if (e.key === "Escape") {
                document.querySelectorAll(".modal.open").forEach(function (m) { m.classList.remove("open"); });
            }
            return;
        }
        var box = document.getElementById("gameBox");
        var onBoard = box && box.querySelector(".sticks-area");
        if (e.key === "1" || e.key === "2" || e.key === "3") {
            if (onBoard && typeof playersTurn !== "undefined" && playersTurn && typeof take === "function") {
                take(parseInt(e.key, 10));
            }
            return;
        }
        if (e.key === "s" || e.key === "S") openSettings();
        else if (e.key === "a" || e.key === "A") openAch();
        else if (e.key === "m" || e.key === "M") { if (typeof cycleSound === "function") cycleSound(); }
        else if (e.key === "r" || e.key === "R") {
            var go = document.getElementById("gameoverScreen");
            if (go && go.classList.contains("active") && typeof closeGameOver === "function") closeGameOver();
        }
    });
}

/* ═══ BOOT ═══ */
window.addEventListener("DOMContentLoaded", function () {
    applyCustom();
    initTrail();
    initKeys();
    document.querySelectorAll(".tool-btn").forEach(function (b) {
        b.addEventListener("pointerenter", sfxHover);
    });
    document.addEventListener("click", function (e) {
        if (e.target.closest(".mode-card") || e.target.closest(".opt-chip") || e.target.closest(".swatch")) sfxHover();
    });
});

/* Expose helpers used by sticks.js */
window.avatarFor = avatarFor;
window.nextWave = nextWave;
window.isPerfectMove = isPerfectMove;
window.bumpCombo = bumpCombo;
window.resetCombo = resetCombo;
window.announceChaos = announceChaos;
window.startTurnTimer = startTurnTimer;
window.stopTurnTimer = stopTurnTimer;
window.playRoundIntro = playRoundIntro;
window.countdown = countdown;
window.fxShake = fxShake;
window.fxLightning = fxLightning;
window.fxChroma = fxChroma;
window.fxVignette = fxVignette;
window.spawnFxImpact = spawnFxImpact;
window.cineBars = cineBars;
window.sfxWin2 = sfxWin2;
