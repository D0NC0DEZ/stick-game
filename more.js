/* ═══════════════════════════════════════════════════════════
   STICK GAME — EXPANSION PACK II
   Opponents · Power-ups · Final-Stick Cinema · XP/Levels
   Daily Challenge · Boss Rush · Fireworks · Parallax · Leaderboard
   ═══════════════════════════════════════════════════════════ */
"use strict";

/* ═══ OPPONENTS ═══ */
window.OPPONENTS = {
    byte: {
        name: "BYTE", emoji: "🤖", tag: "The Classic", color: "#7ad7ff",
        clutch: false, blunder: 0.06,
        taunts: ["Booting up my victory routine.", "01001100 = L.", "Resistance is futile. Statistically.", "I calculated 4 million ways this ends. Want the highlight reel?"],
        winLines: ["The machine prevails. Again.", "Upload complete: your defeat."],
        loseLines: ["Recalibrating... that shouldn't have happened.", "Error 404: my win not found."]
    },
    vex: {
        name: "VEX", emoji: "😈", tag: "The Menace", color: "#ff6ec7",
        clutch: false, blunder: 0.0,
        taunts: ["Oooh, that was cute. Do it again.", "I don't lose. I just let you think you won.", "Your tears lubricate my circuits.", "Scream louder, I'm listening. But not really."],
        winLines: ["Delicious.", "Mmm. Another soul harvested."],
        loseLines: ["Ugh. Fine. You got lucky. Emphasis on LUCKY.", "Enjoy it. It won't happen twice."]
    },
    zen: {
        name: "ZEN", emoji: "🧘", tag: "The Calm", color: "#34d399",
        clutch: true, blunder: 0.0,
        taunts: ["Breathe. The outcome is already written.", "Stillness defeats haste.", "I am the stick. The stick is me.", "There is no losing. Only lessons."],
        winLines: ["Peace, at last.", "The path was always clear."],
        loseLines: ["A worthy reminder of impermanence.", "You found balance. I respect it."]
    },
    glitch: {
        name: "GLITCH", emoji: "👾", tag: "The Unstable", color: "#a78bfa",
        clutch: false, blunder: 0.22,
        taunts: ["W-W-Wait, whose turn is it??", "I may have, uh, miscalculated. On purpose.", "SYSTEM: chaos mode: enabled.", "1 stick? 2 sticks? YES."],
        winLines: ["Even I don't know how I won.", "GLITCH WINS. Somehow."],
        loseLines: ["crash_stack()... probably fine.", "That was NOT in the code."]
    },
    nova: {
        name: "NOVA", emoji: "🌟", tag: "The Prodigy", color: "#ffd93c",
        clutch: true, blunder: 0.02,
        taunts: ["I've already won. You're just catching up.", "Optimal. Every. Time.", "This is math, not luck. Sorry.", "Your best move is my opening move."],
        winLines: ["Textbook execution.", "Another flawless victory."],
        loseLines: ["Impossible... I ran the numbers.", "Noted. It won't repeat."]
    },
    rusty: {
        name: "RUSTY", emoji: "🦾", tag: "The Veteran", color: "#ff9a6c",
        clutch: false, blunder: 0.14,
        taunts: ["Back in my day, sticks were bigger.", "I've seen it all, kid.", "My joints creak, my logic doesn't.", "Don't make me come out of retirement."],
        winLines: ["Old dog, same tricks.", "Experience: 1, you: 0."],
        loseLines: ["Hmph. You earned that one.", "My bolts are loose. Rematch."]
    }
};

var OPP_ORDER = ["byte", "vex", "zen", "glitch", "nova", "rusty"];
var OPP_STARS = { byte: 2, vex: 3, zen: 3, glitch: 2, nova: 5, rusty: 3 };
window.oppFrozen = false;
window.oppSkip = false;
window.playerShield = false;
window.finalDramaDone = false;
window.gauntletIndex = 0;
window.daily = null;

/* ═══ NEW MODES ═══ */
MODES.powerup = { name: "Power-Up",  emoji: "✨", sticks: 21, maxTake: 2, lastLoses: true,  powerup: true, desc: "Golden sticks grant wild powers." };
MODES.daily   = { name: "Daily",     emoji: "📅", sticks: 21, maxTake: 2, lastLoses: true,  daily: true, desc: "A fresh seeded puzzle every day." };
MODES.bossrush = { name: "Boss Rush", emoji: "👑", sticks: 13, maxTake: 2, lastLoses: true, survival: true, bossrush: true, desc: "Defeat 3 rivals. No second chances." };

/* Also fold opponent lines into the global taunt/roast pools */
(function mergeOpponentLines() {
    try {
        Object.keys(OPPONENTS).forEach(function (k) {
            var o = OPPONENTS[k];
            if (o.taunts && typeof taunts !== "undefined") o.taunts.forEach(function (t) { taunts.push(t); });
            if (o.winLines && typeof winSubs !== "undefined") o.winLines.forEach(function (t) { winSubs.push(t); });
            if (o.loseLines && typeof roastMessages !== "undefined") o.loseLines.forEach(function (t) { roastMessages.push(t); });
        });
    } catch (e) {}
})();

/* ═══ PROGRESS / XP / LEVELS ═══ */
window.SKIN_LEVEL = { classic: 1, ice: 1, wood: 1, ghost: 3, gold: 4, lava: 6, rainbow: 8 };

window.progress = (function () {
    var d = { xp: 0, level: 1, lb: [] };
    try {
        var s = JSON.parse(localStorage.getItem("stick_progress_v1"));
        if (s && typeof s === "object") { for (var k in d) if (s[k] !== undefined) d[k] = s[k]; }
    } catch (e) {}
    return d;
})();

function saveProgress() {
    try { localStorage.setItem("stick_progress_v1", JSON.stringify(progress)); } catch (e) {}
}

function xpForLevel(l) { return 80 + (l - 1) * 70; }

function addXp(n) {
    progress.xp += n;
    var leveled = false;
    while (progress.xp >= xpForLevel(progress.level)) {
        progress.xp -= xpForLevel(progress.level);
        progress.level++;
        leveled = true;
        levelUp(progress.level);
    }
    saveProgress();
    updateLevelBadge();
    return leveled;
}

function levelUp(l) {
    if (typeof toastShow === "function") toastShow("⭐", "Level " + l + "!", unlockedText(l));
    if (typeof spawnFireworks === "function") spawnFireworks(2);
    if (typeof fxLightning === "function") fxLightning();
}

function unlockedText(l) {
    var names = [];
    Object.keys(SKIN_LEVEL).forEach(function (s) { if (SKIN_LEVEL[s] === l) names.push(s); });
    return names.length ? "Unlocked: " + names.join(", ") + " skin" : "Keep climbing!";
}

function awardGameXp(isWin) {
    addXp(isWin ? 65 : 20);
    if (isWin) {
        var score = (typeof winStreak !== "undefined" ? winStreak : 0) * 10 + (modeDef ? difficultyBonus(modeDef) : 0);
        recordLeaderboard(score);
    }
}

function difficultyBonus(m) {
    if (!m) return 0;
    if (m.sticks >= 30) return 15;
    if (m.powerup || m.daily || m.bossrush) return 12;
    if (m.maxTake >= 3) return 8;
    return 5;
}

function recordLeaderboard(score) {
    progress.lb.push({
        score: score,
        mode: modeDef ? modeDef.name : "Classic",
        streak: typeof winStreak !== "undefined" ? winStreak : 0,
        date: new Date().toLocaleDateString()
    });
    progress.lb.sort(function (a, b) { return b.score - a.score; });
    progress.lb = progress.lb.slice(0, 5);
    saveProgress();
}

/* Level badge */
function updateLevelBadge() {
    var badge = document.getElementById("levelBadge");
    if (!badge) return;
    var need = xpForLevel(progress.level);
    var pct = Math.max(0, Math.min(1, progress.xp / need));
    var circ = 2 * Math.PI * 15;
    var fill = badge.querySelector(".lb-fill");
    if (fill) fill.style.strokeDashoffset = (circ * (1 - pct)).toFixed(1);
    var lvl = badge.querySelector(".lb-lvl");
    if (lvl) lvl.textContent = progress.level;
    var xp = badge.querySelector(".lb-xp");
    if (xp) xp.textContent = progress.xp + " / " + need + " XP";
}

function buildLevelBadge() {
    if (document.getElementById("levelBadge")) return;
    var circ = 2 * Math.PI * 15;
    var el = document.createElement("div");
    el.className = "level-badge";
    el.id = "levelBadge";
    el.title = "Level & XP — click for stats";
    el.setAttribute("onclick", "openStats()");
    el.innerHTML =
        '<span class="lb-ring"><svg width="34" height="34" viewBox="0 0 34 34">' +
        '<circle class="lb-track" cx="17" cy="17" r="15" fill="none" stroke-width="3"/>' +
        '<circle class="lb-fill" cx="17" cy="17" r="15" fill="none" stroke-width="3" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + circ.toFixed(1) + '"/>' +
        '</svg><span class="lb-lvl">1</span></span>' +
        '<span class="lb-meta"><span class="lb-title">Level</span><br><span class="lb-xp">0 / 80 XP</span></span>';
    document.body.appendChild(el);
    updateLevelBadge();
}

/* ═══ OPPONENT SELECTION ═══ */
window.pendingDiff = "medium";

function showOpponentSelect(diff) {
    pendingDiff = diff;
    difficulty = diff;
    if (modeDef && modeDef.bossrush) { showWhoGoesFirst(diff); return; }
    window.currentScreen = "opponents";
    var box = document.getElementById("gameBox");
    if (!box) return;
    box.style.opacity = "0";
    box.style.transform = "scale(0.95)";
    setTimeout(function () {
        var html = '<button class="nav-back" onclick="showDifficulty()">← Back</button>';
        html += '<p class="diff-section-title">Choose your opponent</p>';
        html += '<div class="opp-grid">';
        html += '<button class="opp-card opp-random" onclick="chooseRandomOpponent()"><span class="opp-avatar">🎲</span><span class="opp-name">Random</span><span class="opp-tag">Fate decides</span></button>';
        OPP_ORDER.forEach(function (id, i) {
            var o = OPPONENTS[id];
            html += '<button class="opp-card" style="--oc:' + o.color + ';animation-delay:' + (i * 0.05) + 's" onclick="chooseOpponent(\'' + id + '\')">' +
                '<span class="opp-avatar">' + o.emoji + '</span>' +
                '<span class="opp-name">' + o.name + '</span>' +
                '<span class="opp-tag">' + o.tag + '</span>' +
                '<span class="opp-stats"><span class="opp-stat">SKILL <b>' + stars(OPP_STARS[id]) + '</b></span></span></button>';
        });
        html += "</div>";
        box.innerHTML = html;
        box.style.opacity = "1";
        box.style.transform = "scale(1)";
    }, 250);
}

function stars(n) {
    var s = "";
    for (var i = 0; i < 5; i++) s += i < n ? "★" : "☆";
    return s;
}

function chooseOpponent(id) {
    window.currentOpp = OPPONENTS[id];
    try { localStorage.setItem("stick_opponent", id); } catch (e) {}
    if (typeof sfxHover === "function") sfxHover();
    showWhoGoesFirst(pendingDiff);
}

/* ═══ OPPONENT PANEL / POWER UI (used by render) ═══ */
function opponentPanelHtml() {
    if (!modeDef) return "";
    if (modeDef.local) return "";
    var o = window.currentOpp || OPPONENTS.byte;
    var active = (typeof playersTurn !== "undefined") && !playersTurn && !gameOver;
    return '<div class="opp-panel' + (active ? " turn-active" : "") + '" style="--oc:' + o.color + '">' +
        '<span class="op-av">' + o.emoji + '</span>' +
        '<span class="op-info"><span class="op-name">' + o.name + '</span><br>' +
        '<span class="op-tag">' + o.tag + '</span>' +
        '<div class="op-mood">' + (active ? "Contemplating your defeat…" : "Awaiting your move") + '</div></span></div>';
}

function powersHtml() {
    var chips = [];
    if (window.playerShield) chips.push(powerChip("🛡️", "Shield", "#7ad7ff", "rgba(120,215,255,.4)"));
    if (window.oppSkip) chips.push(powerChip("🥷", "Steal", "#c9a0ff", "rgba(201,160,255,.4)"));
    if (window.oppFrozen) chips.push(powerChip("❄️", "Freeze", "#67e8f9", "rgba(103,232,249,.4)"));
    if (!chips.length) return "";
    return '<div class="power-bar">' + chips.join("") + "</div>";
}

function powerChip(emoji, label, color, glow) {
    return '<span class="power-chip" style="--pc:' + color + ';--pg:' + glow + '">' + emoji + " " + label + "</span>";
}

/* ═══ POWER-UPS ═══ */
window.powerHit = {};
var POWER_META = {
    shield: { emoji: "🛡️", name: "Shield", desc: "blocks one loss" },
    steal:  { emoji: "🥷", name: "Steal",  desc: "skip the AI's turn" },
    freeze: { emoji: "❄️", name: "Freeze", desc: "next AI move is random" },
    peek:   { emoji: "👁️", name: "Peek",   desc: "reveals the AI's move" },
    surge:  { emoji: "⚡", name: "Surge",  desc: "+2 combo" }
};

function maybeGrantPower() {
    if (!modeDef || !modeDef.powerup) return;
    [8, 5, 3].forEach(function (v) {
        if (sticks === v && !powerHit[v]) {
            powerHit[v] = true;
            grantPower();
        }
    });
}

function grantPower() {
    if (!window.currentOpp) window.currentOpp = OPPONENTS.byte;
    var pool = ["shield", "steal", "freeze", "peek", "surge"];
    var id = pool[Math.floor(Math.random() * pool.length)];
    applyPower(id);
}

function applyPower(id) {
    var meta = POWER_META[id];
    if (id === "shield") window.playerShield = true;
    else if (id === "steal") window.oppSkip = true;
    else if (id === "freeze") window.oppFrozen = true;
    else if (id === "peek") peekShow();
    else if (id === "surge") { if (typeof comboCount !== "undefined") window.comboCount += 2; if (typeof showCombo === "function") showCombo(window.comboCount); }

    if (typeof toastShow === "function") toastShow(meta.emoji, "Power-up: " + meta.name, meta.desc);
    if (typeof spawnTaunt === "function") spawnTaunt("✨ " + (window.currentOpp ? window.currentOpp.name : "AI") + " eyes a golden stick...");
    if (typeof fxLightning === "function") fxLightning();
    if (typeof fxShake === "function") fxShake("shake-hard", 350);
    if (typeof renderPowersNow === "function") renderPowersNow();
}

function peekShow() {
    if (typeof optimalMove !== "function" || !modeDef) return;
    var guess = optimalMove(sticks, modeDef.maxTake);
    if (typeof spawnTaunt === "function") spawnTaunt("👁️ Peek: the AI is likely to take " + guess + " stick" + (guess > 1 ? "s" : "") + ".");
}

/* ═══ FINAL-STICK CINEMATIC ═══ */
function checkFinalStick() {
    if (gameOver || sticks !== 1 || window.finalDramaDone) return;
    window.finalDramaDone = true;
    finalStickDrama();
}

function finalStickDrama() {
    document.body.classList.add("final-stick");
    if (typeof fxChroma === "function") fxChroma();
    if (typeof fxShake === "function") fxShake("shake-hard", 500);
    if (typeof playTone === "function") {
        playTone(58, 0, 0.3, "sine", 0.32);
        try { playTone(58, 0.34, 0.36, "sine", 0.36); } catch (e) {}
    }
    var ov = document.createElement("div");
    ov.className = "final-overlay";
    ov.id = "finalOverlay";
    ov.innerHTML = '<div class="fo-bars"></div><span class="fo-line"></span>' +
        '<div class="final-title">Final Stick</div>' +
        '<div class="final-sub">One stick stands between victory and shame</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add("on"); });
    setTimeout(function () {
        ov.classList.remove("on");
        document.body.classList.remove("final-stick");
        setTimeout(function () { ov.remove(); }, 500);
    }, 1800);
}

/* ═══ FIREWORKS ═══ */
function spawnFireworks(count) {
    count = count || 5;
    for (var i = 0; i < count; i++) {
        (function (i) {
            setTimeout(function () { fireworkRocket(); }, i * 320 + Math.random() * 180);
        })(i);
    }
}

function fireworkRocket() {
    var x = Math.random() * 80 + 10;
    var shell = document.createElement("div");
    shell.className = "firework-shell";
    shell.style.left = x + "vw";
    shell.style.setProperty("--rise", "-" + (40 + Math.random() * 35) + "vh");
    document.body.appendChild(shell);
    setTimeout(function () { shell.remove(); }, 950);
    setTimeout(function () { fireworkBurst(x, 20 + Math.random() * 45); }, 780);
}

function fireworkBurst(xvw, yvh) {
    var colors = ["#ff5f6d", "#ffd700", "#47cf73", "#4facfe", "#b06ab3", "#ff9a3c", "#67e8f9"];
    var color = colors[Math.floor(Math.random() * colors.length)];
    var cx = (xvw / 100) * window.innerWidth;
    var cy = (yvh / 100) * window.innerHeight;
    var n = 22;
    for (var i = 0; i < n; i++) {
        var ang = (Math.PI * 2 * i) / n;
        var dist = 60 + Math.random() * 90;
        var p = document.createElement("div");
        p.className = "firework";
        p.style.left = cx + "px";
        p.style.top = cy + "px";
        p.style.background = color;
        p.style.boxShadow = "0 0 10px " + color;
        p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
        p.style.setProperty("--dy", Math.sin(ang) * dist + "px");
        document.body.appendChild(p);
        setTimeout(function () { p.remove(); }, 1100);
    }
    if (typeof playTone === "function") playTone(320 + Math.random() * 260, 0, 0.25, "triangle", 0.06, 120);
}

/* ═══ PARALLAX BACKGROUND ═══ */
function initParallax() {
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    var orbs = document.querySelector(".bg-orbs");
    if (!orbs) return;
    var tx = 0, ty = 0, x = 0, y = 0;
    document.addEventListener("pointermove", function (e) {
        tx = (e.clientX / window.innerWidth - 0.5) * 40;
        ty = (e.clientY / window.innerHeight - 0.5) * 40;
    });
    (function loop() {
        x += (tx - x) * 0.06;
        y += (ty - y) * 0.06;
        orbs.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0)";
        requestAnimationFrame(loop);
    })();
}

/* ═══ DAILY CHALLENGE ═══ */
function mulberry32(a) {
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function dailyConfig() {
    var d = new Date();
    var seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    var rnd = mulberry32(seed);
    var sticks = 15 + Math.floor(rnd() * 15);
    var maxTake = rnd() < 0.5 ? 2 : 3;
    var lastLoses = rnd() < 0.85;
    return { sticks: sticks, maxTake: maxTake, lastLoses: lastLoses, seed: seed };
}

function applyModeSetup() {
    if (!modeDef) return;
    if (modeDef.daily) {
        window.daily = dailyConfig();
        sticks = window.daily.sticks;
        modeDef.maxTake = window.daily.maxTake;
        modeDef.lastLoses = window.daily.lastLoses;
    }
    if (modeDef.bossrush) {
        var id = OPP_ORDER[Math.min(gauntletIndex, OPP_ORDER.length - 1)];
        window.currentOpp = OPPONENTS[id];
        sticks = 13 + gauntletIndex * 3;
    }
}

/* ═══ CUSTOM ROASTS ═══ */
window.customRoasts = (function () {
    try { return JSON.parse(localStorage.getItem("stick_roasts_v1")) || []; } catch (e) { return []; }
})();

function saveRoasts() {
    try { localStorage.setItem("stick_roasts_v1", JSON.stringify(window.customRoasts)); } catch (e) {}
}

function mergeCustomRoasts() {
    if (typeof roastMessages === "undefined") return;
    window.customRoasts.forEach(function (r) {
        if (r && roastMessages.indexOf(r) === -1) roastMessages.push(r);
    });
}

function addCustomRoasts(text) {
    var lines = String(text || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
    window.customRoasts = lines.slice(0, 30);
    saveRoasts();
    if (typeof roastMessages !== "undefined") {
        window.customRoasts.forEach(function (r) {
            if (roastMessages.indexOf(r) === -1) roastMessages.push(r);
        });
    }
    if (typeof toastShow === "function") toastShow("🍳", "Roasts saved", window.customRoasts.length + " custom lines");
}
mergeCustomRoasts();

/* ═══ SETTINGS EXTRAS ═══ */
function appendMoreSettings() {
    var body = document.getElementById("settingsBody");
    if (!body) return;

    var wrap = document.createElement("div");
    wrap.className = "set-section";
    wrap.innerHTML =
        '<div class="set-label">Custom roasts (one per line)</div>' +
        '<textarea class="roast-area" id="roastEditor" maxlength="600" placeholder="Type your own roast lines...&#10;The one below is your doom.">' +
        escapeAttrSafe(window.customRoasts.join("\n")) + '</textarea>' +
        '<button class="btn btn-mini" onclick="addCustomRoasts(document.getElementById(\'roastEditor\').value)">💾 Save roasts</button>';
    body.appendChild(wrap);

    var wrap2 = document.createElement("div");
    wrap2.className = "set-section";
    wrap2.innerHTML = '<div class="set-label">Display</div>' +
        switchRow("CRT glow", "crt", document.body.classList.contains("crt"));
    body.appendChild(wrap2);

    var skins = body.querySelectorAll("[data-skinopt]");
    skins.forEach(function (b) {
        var id = b.getAttribute("data-skinopt");
        var req = SKIN_LEVEL[id] || 1;
        if (progress.level < req) {
            b.classList.add("locked");
            b.setAttribute("title", "Unlocks at level " + req);
        }
    });
}

function switchRow(label, key, on) {
    return '<div class="switch-row"><span>' + label + '</span><button class="switch' + (on ? " on" : "") + '" id="msw_' + key + '" onclick="toggleMorePref(\'' + key + '\', this)"></button></div>';
}

function toggleMorePref(key, btn) {
    if (key === "crt") {
        var on = document.body.classList.toggle("crt");
        if (btn) btn.classList.toggle("on", on);
        if (typeof sfxHover === "function") sfxHover();
    }
}

function escapeAttrSafe(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ═══ LEADERBOARD RENDER (used by stats modal) ═══ */
function leaderboardHtml() {
    if (!progress.lb.length) return '<div class="stat-box" style="margin-top:12px"><div class="sb-lab">No wins recorded yet</div></div>';
    var html = '<div class="set-label" style="margin:18px 0 4px">Leaderboard (top 5)</div><div class="lb-list">';
    progress.lb.forEach(function (r, i) {
        html += '<div class="lb-row" style="animation-delay:' + (i * 0.05) + 's">' +
            '<span class="lb-rank">#' + (i + 1) + '</span>' +
            '<span class="lb-mode">' + r.mode + '</span>' +
            '<span class="lb-detail">🔥 ' + r.streak + ' · ' + r.score + ' pts · ' + r.date + '</span></div>';
    });
    html += "</div>";
    return html;
}

/* ═══ BOOT ═══ */
window.addEventListener("DOMContentLoaded", function () {
    buildLevelBadge();
    initParallax();
    try {
        var saved = localStorage.getItem("stick_opponent");
        if (saved && OPPONENTS[saved]) window.currentOpp = OPPONENTS[saved];
    } catch (e) {}
});

/* ═══ WRAP EXISTING FUNCTIONS (hooks) ═══ */
(function wireHooks() {
    /* Reset per-game state + apply mode setup on every new game */
    var _startGame = startGame;
    startGame = function (first) {
        window.finalDramaDone = false;
        window.powerHit = {};
        window.playerShield = false;
        window.oppSkip = false;
        window.oppFrozen = false;
        _startGame(first);
        if (typeof applyModeSetup === "function") applyModeSetup();
    };

    /* Boss rush advances opponents; resets gauntlet on mode pick */
    var _nextWave = nextWave;
    nextWave = function () {
        if (modeDef && modeDef.bossrush) {
            gauntletIndex++;
            if (gauntletIndex >= 3) { bossRushComplete(); return; }
        }
        _nextWave();
    };

    var _chooseMode = chooseMode;
    chooseMode = function (id) {
        if (id === "bossrush") { gauntletIndex = 0; survivalWave = 1; }
        if (id === "daily") window.daily = dailyConfig();
        _chooseMode(id);
    };

    /* Settings: append extra sections after the base builder runs */
    var _openSettings = openSettings;
    openSettings = function () {
        _openSettings();
        appendMoreSettings();
    };

    /* Gate skins behind levels */
    var _setSkin = setSkin;
    setSkin = function (id) {
        var req = SKIN_LEVEL[id] || 1;
        if (progress.level < req) {
            if (typeof toastShow === "function") toastShow("🔒", "Locked skin", "Reach level " + req + " to unlock");
            return;
        }
        _setSkin(id);
    };

    /* Add leaderboard to the stats modal */
    var _buildStats = buildStats;
    buildStats = function () {
        _buildStats();
        var body = document.getElementById("statsBody");
        if (body) body.insertAdjacentHTML("beforeend", leaderboardHtml());
    };
})();

function bossRushComplete() {
    if (typeof spawnFireworks === "function") spawnFireworks(7);
    if (typeof toastShow === "function") toastShow("👑", "BOSS RUSH CLEARED!", "You defeated all three rivals!");
    if (typeof playWinFanfare === "function") playWinFanfare();
    var screen = document.getElementById("gameoverScreen");
    if (screen) { screen.classList.remove("active"); screen.innerHTML = ""; }
    setTimeout(function () { if (typeof openModeSelect === "function") openModeSelect(); }, 1800);
}

/* Expose helpers used by sticks.js */
window.opponentPanelHtml = opponentPanelHtml;
window.powersHtml = powersHtml;
window.maybeGrantPower = maybeGrantPower;
window.checkFinalStick = checkFinalStick;
window.awardGameXp = awardGameXp;
window.spawnFireworks = spawnFireworks;
