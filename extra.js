/* ═══════════════════════════════════════════════════════════
   STICK GAME — EXPANSION PACK III
   Navigation (back buttons) · Custom Match · Rematch
   Surprise Me · Extra achievements · Opponent records
   ═══════════════════════════════════════════════════════════ */
"use strict";

/* ── Progress extras ── */
window.currentScreen = "start";
window.customMatch = { sticks: 21, maxTake: 2, lastLoses: true };
window.bossCleared = false;

progress.usedPowers = progress.usedPowers || 0;
progress.beaten = progress.beaten || {};
progress.oppRecord = progress.oppRecord || {};
progress.dailyPlayed = progress.dailyPlayed || false;
progress.customPlayed = progress.customPlayed || false;

/* ── Custom Match mode card ── */
MODES.custom = { name: "Custom", emoji: "🛠️", sticks: 21, maxTake: 2, lastLoses: true, customMatch: true, desc: "Set your own sticks, limit & rule." };

/* ── Extra achievements ── */
var EXTRA_ACHS = [
    { id: "dailyPlay", name: "Daily Grind", emoji: "📅" },
    { id: "customFan", name: "House Rules", emoji: "🛠️" },
    { id: "powerUser", name: "Power Player", emoji: "✨" },
    { id: "rivalSlayer", name: "Rival Slayer", emoji: "🥊" },
    { id: "bossSlayer", name: "Boss Slayer", emoji: "👑" },
    { id: "level5", name: "Rising Star", emoji: "⭐" },
    { id: "level10", name: "Ascended", emoji: "🌟" }
];
if (typeof achDefs !== "undefined") {
    EXTRA_ACHS.forEach(function (a) { if (!achDefs.some(function (x) { return x.id === a.id; })) achDefs.push(a); });
}

/* ═══ NAVIGATION ═══ */
function showStartScreen() {
    currentScreen = "start";
    var box = document.getElementById("gameBox");
    if (!box) return;
    box.style.opacity = "0";
    box.style.transform = "scale(0.95)";
    setTimeout(function () {
        box.innerHTML =
            '<p class="instructions">Take turns removing <strong>1</strong> or <strong>2</strong> sticks from the pile. The player forced to take the last stick <strong>loses</strong>!</p>' +
            '<button class="btn btn-glow pulse" onclick="openModeSelect()">Start Game</button>' +
            '<div class="start-extras">' +
            '<button class="mini-link" onclick="openSettings()">⚙️ Customize</button>' +
            '<button class="mini-link" onclick="openAch()">🏅 Achievements</button>' +
            '<button class="mini-link" onclick="openStats()">📊 Stats</button>' +
            '</div>' +
            '<div class="quick-help">🎮 <b>1/2/3</b> take sticks &middot; <b>Esc</b> go back &middot; <b>S</b> settings &middot; <b>A</b> achievements &middot; <b>M</b> mute</div>';
        box.style.opacity = "1";
        box.style.transform = "scale(1)";
    }, 250);
}

function navBack() {
    switch (currentScreen) {
        case "first": navWhoBack(); break;
        case "opponents": showDifficulty(); break;
        case "difficulty": openModeSelect(); break;
        case "modes": showStartScreen(); break;
        case "custom": openModeSelect(); break;
        default: break;
    }
}

function navWhoBack() {
    if (modeDef && modeDef.bossrush) { showDifficulty(); return; }
    showOpponentSelect(pendingDiff || difficulty || "medium");
}

/* Escape = back (when not in a modal/input) */
document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (document.querySelector(".modal.open")) return;
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (["first", "opponents", "difficulty", "modes", "custom"].indexOf(currentScreen) !== -1) navBack();
});

/* In-game quit → back to mode select */
function quitToModes() {
    if (typeof stopTurnTimer === "function") stopTurnTimer();
    if (typeof clearIdle === "function") clearIdle();
    gameOver = true;
    openModeSelect();
}

/* ═══ REMATCH ═══ */
function rematch() {
    var screen = document.getElementById("gameoverScreen");
    if (screen) { screen.classList.remove("active"); screen.innerHTML = ""; }
    if (typeof stopTurnTimer === "function") stopTurnTimer();
    if (typeof resetCombo === "function") resetCombo();
    if (modeDef && modeDef.bossrush) window.gauntletIndex = 0;
    if (typeof startGame === "function") startGame(goesFirst || "player");
}

/* ═══ SURPRISE ME ═══ */
function surpriseMe() {
    if (typeof animating !== "undefined" && animating) return;
    var ids = Object.keys(MODES).filter(function (k) { return !MODES[k].local && k !== "custom"; });
    var id = ids[Math.floor(Math.random() * ids.length)];
    currentMode = id;
    modeDef = MODES[id];
    if (modeDef.bossrush) window.gauntletIndex = 0;
    if (modeDef.survival && !modeDef.bossrush) window.survivalWave = 1;
    var diffs = ["easy", "medium", "hard"];
    difficulty = diffs[Math.floor(Math.random() * diffs.length)];
    var opps = OPP_ORDER.slice();
    window.currentOpp = OPPONENTS[opps[Math.floor(Math.random() * opps.length)]];
    if (typeof toastShow === "function") toastShow("🎲", "Surprise!", modeDef.name + " · " + capitalize(difficulty) + " · vs " + window.currentOpp.name);
    if (typeof fxChroma === "function") fxChroma();
    startGame(Math.random() < 0.5 ? "player" : "computer");
}

function chooseRandomOpponent() {
    var id = OPP_ORDER[Math.floor(Math.random() * OPP_ORDER.length)];
    if (typeof toastShow === "function") toastShow("🎲", "Random rival", OPPONENTS[id].name);
    chooseOpponent(id);
}

/* ═══ CUSTOM MATCH ═══ */
function openCustomConfig() {
    currentScreen = "custom";
    var box = document.getElementById("gameBox");
    if (!box) return;
    box.style.opacity = "0";
    box.style.transform = "scale(0.95)";
    setTimeout(function () {
        var m = customMatch;
        var html = '<button class="nav-back" onclick="openModeSelect()">← Modes</button>';
        html += '<p class="diff-section-title">Custom Match</p>';
        html += '<div class="custom-cfg">';
        html += stepper("Sticks", "sticks", m.sticks);
        html += stepper("Max take", "maxTake", m.maxTake);
        html += '<div class="cfg-row"><span>Last stick</span><div class="seg">' +
            '<button class="seg-btn ' + (m.lastLoses ? "on" : "") + '" onclick="setCustomRule(true)">Loses</button>' +
            '<button class="seg-btn ' + (!m.lastLoses ? "on" : "") + '" onclick="setCustomRule(false)">Wins</button>' +
            '</div></div>';
        html += "</div>";
        html += '<button class="btn btn-glow" onclick="commitCustomMatch()">Continue ▶</button>';
        box.innerHTML = html;
        box.style.opacity = "1";
        box.style.transform = "scale(1)";
    }, 250);
}

function stepper(label, key, val) {
    return '<div class="cfg-row"><span>' + label + '</span><div class="stepper">' +
        '<button class="step-btn" onclick="adjustCustom(\'' + key + '\',-1)">−</button>' +
        '<span class="step-val" id="cfg_' + key + '">' + val + '</span>' +
        '<button class="step-btn" onclick="adjustCustom(\'' + key + '\',1)">+</button></div></div>';
}

function adjustCustom(key, delta) {
    var min = key === "sticks" ? 3 : 1;
    var max = key === "sticks" ? 60 : 5;
    customMatch[key] = Math.max(min, Math.min(max, customMatch[key] + delta));
    var el = document.getElementById("cfg_" + key);
    if (el) el.textContent = customMatch[key];
    if (typeof sfxHover === "function") sfxHover();
}

function setCustomRule(lastLoses) {
    customMatch.lastLoses = lastLoses;
    openCustomConfig();
}

function commitCustomMatch() {
    window.modeDef = {
        name: "Custom", emoji: "🛠️",
        sticks: customMatch.sticks,
        maxTake: customMatch.maxTake,
        lastLoses: customMatch.lastLoses,
        custom: true,
        desc: "Your rules, your doom."
    };
    window.currentMode = "custom";
    if (typeof sfxHover === "function") sfxHover();
    showDifficulty();
}

/* ═══ ACHIEVEMENT CHECKS ═══ */
function oppKey(o) {
    for (var k in OPPONENTS) { if (OPPONENTS[k] === o) return k; }
    return null;
}

function checkExtraAchs() {
    if (typeof unlockAch !== "function") return;
    if (progress.dailyPlayed) unlockAch("dailyPlay", "Daily Grind", "📅");
    if (progress.customPlayed) unlockAch("customFan", "House Rules", "🛠️");
    if (progress.usedPowers >= 5) unlockAch("powerUser", "Power Player", "✨");
    if (Object.keys(progress.beaten).length >= 6) unlockAch("rivalSlayer", "Rival Slayer", "🥊");
    if (window.bossCleared) unlockAch("bossSlayer", "Boss Slayer", "👑");
    if (progress.level >= 5) unlockAch("level5", "Rising Star", "⭐");
    if (progress.level >= 10) unlockAch("level10", "Ascended", "🌟");
}

function onGameEnd(isWin) {
    try {
        if (modeDef && modeDef.daily) progress.dailyPlayed = true;
        if (modeDef && modeDef.custom) progress.customPlayed = true;
        if (window.currentOpp && modeDef && !modeDef.bossrush && !modeDef.local) {
            var key = oppKey(window.currentOpp);
            if (key) {
                progress.oppRecord[key] = progress.oppRecord[key] || { w: 0, l: 0 };
                if (isWin) { progress.oppRecord[key].w++; progress.beaten[key] = true; }
                else progress.oppRecord[key].l++;
            }
        }
        saveProgress();
        checkExtraAchs();
    } catch (e) {}
}

/* ═══ OPPONENT RECORD (stats modal) ═══ */
function oppRecordHtml() {
    var any = false;
    var html = '<div class="set-label" style="margin:18px 0 4px">Rival records</div><div class="opp-record">';
    OPP_ORDER.forEach(function (id) {
        var o = OPPONENTS[id];
        var rec = progress.oppRecord[id];
        if (!rec) return;
        any = true;
        var beaten = progress.beaten[id] ? '<span class="rec-crown">👑</span>' : "";
        html += '<div class="rec-row" style="--oc:' + o.color + '"><span class="rec-name">' + o.emoji + " " + o.name + beaten + '</span>' +
            '<span class="rec-score">' + rec.w + "W · " + rec.l + "L</span></div>";
    });
    html += "</div>";
    return any ? html : "";
}

/* ═══ HOOKS ═══ */
(function wireHooks3() {
    /* Custom match intercepts chooseMode before the real selector */
    var _chooseMode = chooseMode;
    chooseMode = function (id) {
        if (id === "custom") { openCustomConfig(); return; }
        _chooseMode(id);
    };

    /* Run end-of-game bookkeeping after the screen is shown */
    var _showGameOverScreen = showGameOverScreen;
    showGameOverScreen = function (isWin, lostStreak) {
        _showGameOverScreen(isWin, lostStreak);
        onGameEnd(isWin);
    };

    /* Count powers used */
    if (typeof applyPower === "function") {
        var _applyPower = applyPower;
        applyPower = function (id) {
            _applyPower(id);
            progress.usedPowers = (progress.usedPowers || 0) + 1;
            saveProgress();
            checkExtraAchs();
        };
    }

    /* Level achievements */
    var _levelUp = levelUp;
    levelUp = function (l) { _levelUp(l); checkExtraAchs(); };

    /* Boss rush cleared */
    var _bossRushComplete = bossRushComplete;
    bossRushComplete = function () { window.bossCleared = true; _bossRushComplete(); checkExtraAchs(); };

    /* Append rival records to the stats modal (after leaderboard) */
    var _buildStats = buildStats;
    buildStats = function () {
        _buildStats();
        var body = document.getElementById("statsBody");
        if (body) body.insertAdjacentHTML("beforeend", oppRecordHtml());
    };
})();

/* ═══ BOOT ═══ */
window.addEventListener("DOMContentLoaded", function () {
    currentScreen = "start";
});
