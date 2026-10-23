/* ═══════════════════════════════════════════════════════════
   STICK GAME — ULTIMATE PACK
   New modes (Mirror · Fortune · Fuse · Series)
   Coach hints · Undo · Emote wheel · New rivals
   Customization (skins · themes · trails · celebrations)
   Secrets, achievements & a whole lot of juice
   ═══════════════════════════════════════════════════════════ */
"use strict";

/* ═══ 1. NEW GAME MODES ═══ */
MODES.mirror = {
    name: "Mirror", emoji: "🪞", sticks: 21, maxTake: 2, lastLoses: true, mirror: true,
    desc: "Whatever the machine takes, you must take."
};
MODES.fortune = {
    name: "Fortune", emoji: "🎰", sticks: 21, maxTake: 2, lastLoses: true, fortune: true,
    desc: "The take-limit shuffles every single turn."
};
MODES.fuse = {
    name: "Fuse", emoji: "💣", sticks: 23, maxTake: 2, lastLoses: true, fuse: true,
    desc: "Every 4th move, two sticks detonate."
};
MODES.series = {
    name: "Series", emoji: "🏆", sticks: 21, maxTake: 2, lastLoses: true, series: true,
    desc: "Best of three against the machine."
};

/* ═══ 2. NEW RIVALS ═══ */
OPPONENTS.oracle = {
    name: "ORACLE", emoji: "👁️", tag: "The Seer", color: "#9be7ff",
    clutch: true, blunder: 0,
    taunts: ["I have already seen this ending.", "Every branch of this tree ends in my win.", "You move like a man reading a menu in a language he doesn't speak.", "The sticks told me your next move. They laughed."],
    winLines: ["As foretold.", "The vision never blinks."],
    loseLines: ["The vision... flickered.", "Impossible. I saw a different future."]
};
OPPONENTS.jester = {
    name: "JESTER", emoji: "🃏", tag: "The Wildcard", color: "#ffe066",
    clutch: false, blunder: 0.35,
    taunts: ["Half my moves are jokes. The other half are ALSO jokes.", "Is the pile smaller or am I just happy to see you?", "I don't have a strategy, I have a VIBE.", "Committing crimes against probability, as usual."],
    winLines: ["HA! Somehow that worked!", "The joke is on you. It was never on me."],
    loseLines: ["Worth it. Absolutely worth it.", "I meant to do that. Probably."]
};

try {
    OPP_ORDER.push("oracle", "jester");
    OPP_STARS.oracle = 5;
    OPP_STARS.jester = 1;
    OPPONENTS.oracle.taunts.forEach(function (t) { taunts.push(t); });
    OPPONENTS.jester.taunts.forEach(function (t) { taunts.push(t); });
    OPPONENTS.oracle.winLines.forEach(function (t) { winSubs.push(t); });
    OPPONENTS.jester.winLines.forEach(function (t) { winSubs.push(t); });
    OPPONENTS.oracle.loseLines.forEach(function (t) { roastMessages.push(t); });
    OPPONENTS.jester.loseLines.forEach(function (t) { roastMessages.push(t); });
} catch (e) {}

/* ═══ 3. CUSTOMIZATION ADDITIONS ═══ */
THEMES.synth = { name: "Synthwave", c1: "#ff2fb9", c2: "#8b5cf6", c3: "#22d3ee" };
THEMES.gilded = { name: "Gilded", c1: "#f5c542", c2: "#a16207", c3: "#fde68a" };
THEMES.void = { name: "Void", c1: "#a78bfa", c2: "#4c1d95", c3: "#f5f5f5" };

SKINS.crystal = "Crystal";
SKINS.cyber = "Cyber";
SKINS.toxic = "Toxic";
SKINS.prism = "Prism";

SKIN_LEVEL.crystal = 5;
SKIN_LEVEL.cyber = 7;
SKIN_LEVEL.toxic = 2;
SKIN_LEVEL.prism = 99;

AVATARS.push("🐙", "🦖", "🎃", "🦋", "🐧", "🦈", "🪐", "🧿");

WEATHERS.push("petals", "sparks");
THEME_WEATHER.synth = "sparks";
THEME_WEATHER.gilded = "sparks";
THEME_WEATHER.void = "stars";

var TRAIL_STYLES = { dot: "Classic", spark: "Sparkle", flame: "Flame", prism: "Prism" };
var CELEBRATIONS = { party: "Confetti party", storm: "Thunder storm", royal: "Royal gold" };
var MUSIC_MOODS = { ambient: "Ambient", pulse: "Pulse", off: "Off" };

/* ── New default keys for returning players ── */
(function migrateCustom() {
    var extra = { coach: false, calm: false, trailStyle: "dot", celebration: "party", music: "ambient" };
    var touched = false;
    for (var k in extra) {
        if (custom[k] === undefined) { custom[k] = extra[k]; touched = true; }
    }
    if (touched) saveCustom();
})();

/* ═══ 4. MATCH / UNDO / FUSE / SERIES STATE ═══ */
window.undoStack = [];
window.undosLeft = 1;
window.oppLastTake = 0;
window.fuseMoves = 0;
window.series = { p: 0, c: 0 };
window.seriesLive = false;
window.emoteCount = 0;

/* ═══ 5. FORTUNE MODE ═══ */
function rollFortune(announce) {
    if (!modeDef || !modeDef.fortune) return;
    modeDef.maxTake = 1 + Math.floor(Math.random() * 4);
    if (announce) {
        spawnTaunt("🎰 FORTUNE SHIFTS — take up to " + modeDef.maxTake + " this turn");
        if (typeof fxChroma === "function") fxChroma();
        if (typeof playTone === "function") { try { playTone(700, 0, 0.2, "square", 0.07, 1200); } catch (e) {} }
    }
}

/* ═══ 6. FUSE MODE ═══ */
function afterMove() {
    if (!modeDef || gameOver) return;
    if (modeDef.fuse) fuseTick();
    if (modeDef.fortune) rollFortune(true);
}

function fuseTick() {
    if (!modeDef || !modeDef.fuse || gameOver) return;
    window.fuseMoves = (window.fuseMoves || 0) + 1;
    var box = document.getElementById("gameBox");

    if (window.fuseMoves % 4 === 0) {
        if (sticks > 4) {
            fuseDetonate(box);
            return;
        }
        window.fuseMoves = 0;
        spawnTaunt("💣 The fuse sputters... not enough sticks to burn!");
    }
    if (box && box.querySelector(".sticks-area")) render(box);
}

function fuseDetonate(box) {
    sticks -= 2;
    window.fuseMoves = 0;
    logMessage("💣 FUSE LIT! 2 sticks vaporized. " + sticks + " left.");
    spawnTaunt("💣 BOOM. Two sticks never saw it coming.");

    if (typeof playTone === "function") {
        try {
            playTone(58, 0, 0.5, "sawtooth", 0.3, 30);
            playTone(120, 0.02, 0.3, "square", 0.14, 50);
        } catch (e) {}
    }
    if (typeof fxShake === "function") fxShake("shake-hard", 460);
    if (typeof fxLightning === "function") fxLightning();
    if (typeof fxChroma === "function") fxChroma();
    if (box && box.querySelector(".sticks-area")) render(box);
}

/* ═══ 7. UNDO ═══ */
function pushUndo() {
    if (gameOver || window.undosLeft <= 0) return;
    window.undoStack.push({
        sticks: sticks,
        oppLastTake: window.oppLastTake || 0,
        fuseMoves: window.fuseMoves || 0,
        combo: typeof comboCount !== "undefined" ? comboCount : 0
    });
    if (window.undoStack.length > 4) window.undoStack.shift();
}

function canUndo() {
    return !gameOver && playersTurn && !animating &&
        window.undosLeft > 0 && window.undoStack.length > 0 && modeDef && !modeDef.local;
}

function undoMove() {
    if (!canUndo()) return;
    var snap = window.undoStack.pop();
    if (!snap) return;

    sticks = snap.sticks;
    window.oppLastTake = snap.oppLastTake || 0;
    window.fuseMoves = snap.fuseMoves || 0;
    window.finalDramaDone = false;
    window.undosLeft--;
    playersTurn = true;
    animating = false;

    if (typeof stopTurnTimer === "function") stopTurnTimer();
    if (typeof clearIdle === "function") clearIdle();
    if (typeof resetCombo === "function") resetCombo();

    logMessage("↩ Rewind! Back to " + sticks + " sticks.");
    if (typeof toastShow === "function") toastShow("↩", "Rewind!", window.undosLeft > 0 ? "No more rewinds this game" : "That was your last one");
    if (typeof playTone === "function") { try { playTone(880, 0, 0.28, "triangle", 0.1, 320); } catch (e) {} }

    render(document.getElementById("gameBox"));

    if (modeDef.timed) startTurnTimer(modeDef.timed);
    if (window.undosLeft <= 0) {
        /* achievement handled on use */
    }
    if (typeof unlockAch === "function") unlockAch("undoUsed", "Rewind!", "🕰️");
    setTimeout(watchIdle, 700);
}

/* ═══ 8. RENDER EXTRAS (HUD · Coach · Undo · Mirror) ═══ */
function mirrorAllowed() {
    if (!modeDef || !modeDef.mirror) return 0;
    if (!window.oppLastTake) return 0;
    if (window.oppLastTake > modeDef.maxTake) return 0;
    if (window.oppLastTake > sticks) return 0;
    return window.oppLastTake;
}

function afterRender(box) {
    if (!box || !modeDef) return;

    /* ── HUD chips ── */
    var chips = [];
    if (modeDef.mirror) {
        var m = mirrorAllowed();
        chips.push('<span class="hud-chip cyan">🪞 ' + (m ? "mirror: take " + m : "free move") + "</span>");
    }
    if (modeDef.fortune) chips.push('<span class="hud-chip gold">🎰 limit ' + modeDef.maxTake + "</span>");
    if (modeDef.series) chips.push('<span class="hud-chip">🏆 series ' + window.series.p + "–" + window.series.c + "</span>");
    if (!modeDef.local && !gameOver) {
        chips.push('<button class="hud-chip coach-toggle' + (custom.coach ? " on" : "") + '" data-key="coach" onclick="ultToggle(this)">🧭 Coach: ' + (custom.coach ? "ON" : "OFF") + "</button>");
    }

    if (chips.length) {
        var anchor = box.querySelector(".opp-panel") || box.querySelector(".mode-badge") || box.querySelector(".sticks-count");
        if (anchor) anchor.insertAdjacentHTML("afterend", '<div class="ult-hud">' + chips.join("") + "</div>");
    }

    /* ── Fuse meter ── */
    if (modeDef.fuse && !gameOver) {
        var pct = Math.min(100, ((window.fuseMoves || 0) / 4) * 100);
        var sc = box.querySelector(".sticks-count");
        if (sc) {
            sc.insertAdjacentHTML("afterend",
                '<div class="fuse-meter">💣 fuse <span class="fuse-track"><span class="fuse-fill" style="width:' + pct + '%"></span></span> ' +
                (window.fuseMoves || 0) + "/4</div>");
        }
    }

    if (gameOver) return;

    /* ── Mirror: lock the buttons ── */
    var restrict = mirrorAllowed();
    if (restrict && playersTurn) {
        var btns = box.querySelectorAll("button.btn");
        for (var i = 0; i < btns.length; i++) {
            var oc = btns[i].getAttribute("onclick") || "";
            var mm = oc.match(/take\((\d+)\)/);
            if (mm && parseInt(mm[1], 10) !== restrict) {
                btns[i].style.display = "none";
            }
        }
        var area = box.querySelector(".sticks-area") || box.querySelector(".ult-hud");
        if (area) area.insertAdjacentHTML("afterbegin", '<div class="mirror-note">🪞 The mirror demands exactly ' + restrict + "</div>");
    }

    /* ── Coach ── */
    if (custom.coach && playersTurn && !modeDef.local && !restrict && typeof optimalMove === "function" && sticks > 0) {
        var best = optimalMove(sticks, modeDef.maxTake);
        var all = box.querySelectorAll("button.btn");
        for (var j = 0; j < all.length; j++) {
            var attr = all[j].getAttribute("onclick") || "";
            var mv = attr.match(/take\((\d+)\)/);
            if (mv && parseInt(mv[1], 10) === best) {
                all[j].classList.add("coach-pick");
                break;
            }
        }
        box.insertAdjacentHTML("beforeend",
            '<div class="coach-note">🧭 Coach says: take <b>' + best + "</b> — that leaves the machine with losing pile" + (best > 1 ? "s" : "") + ".</div>");
    }

    /* ── Undo ── */
    if (canUndo()) {
        box.insertAdjacentHTML("beforeend",
            '<button class="btn undo-btn" onclick="undoMove()">↩ Rewind <span>(' + window.undosLeft + " left)</span></button>");
    }
}

/* ═══ 9. EMOTES ═══ */
var EMOTES = ["😂", "🔥", "😤", "🫡", "😴", "🎯", "💀", "🤝", "👏", "🫠", "🤡", "🏆"];

function buildEmoteWheel() {
    var wheel = document.getElementById("emoteWheel");
    if (!wheel || wheel.childElementCount) return;
    var html = "";
    EMOTES.forEach(function (e) {
        html += '<button class="emote-btn" onclick="sendEmote(\'' + e + '\')">' + e + "</button>";
    });
    wheel.innerHTML = html;
}

function toggleEmotes() {
    var wheel = document.getElementById("emoteWheel");
    if (!wheel) return;
    wheel.classList.toggle("open");
    if (typeof playClick === "function") playClick();
}

function closeEmotes() {
    var wheel = document.getElementById("emoteWheel");
    if (wheel) wheel.classList.remove("open");
}

function showEmoteBubble(who, face, text) {
    var b = document.createElement("div");
    b.className = "emote-bubble";
    b.innerHTML = '<span class="em-who"></span><span class="em-face"></span>' + (text ? '<span class="em-text"></span>' : "");
    b.querySelector(".em-who").textContent = who;
    b.querySelector(".em-face").textContent = face;
    if (text) b.querySelector(".em-text").textContent = text;
    document.body.appendChild(b);
    setTimeout(function () { b.remove(); }, 2600);
}

function sendEmote(face) {
    closeEmotes();
    var who = (modeDef && modeDef.local) ? "Player " + localPlayer : (custom.name || "Player");
    showEmoteBubble(who, face, "");
    if (typeof playTone === "function") { try { playTone(520, 0, 0.12, "triangle", 0.06, 780); } catch (e) {} }
    if (typeof logMessage === "function") logMessage(face + "  " + who + " reacts.");

    window.emoteCount = (window.emoteCount || 0) + 1;
    if (window.emoteCount === 10 && typeof unlockAch === "function") unlockAch("emoteTalk", "Trash Talker", "📣");

    if (modeDef && !modeDef.local && !gameOver) setTimeout(aiEmoteReply, 1000);
}

function aiEmoteReply() {
    if (gameOver) return;
    var opp = window.currentOpp || OPPONENTS.byte;
    var faces = ["😂", "🗿", "😤", "💀", "🫡", "🔥"];
    var face = faces[Math.floor(Math.random() * faces.length)];
    var pool = (opp.taunts && opp.taunts.length) ? opp.taunts : taunts;
    var line = Math.random() < 0.5 ? pool[Math.floor(Math.random() * pool.length)] : "";
    showEmoteBubble(opp.emoji + " " + opp.name, face, line);
    if (line && typeof logMessage === "function") logMessage("🤖 " + opp.name + ": " + line);
}

/* ═══ 10. SERIES (BEST OF 3) ═══ */
function seriesHtml() {
    return '<div class="series-score">' +
        '<span class="ss-side you">YOU ' + window.series.p + "</span>" +
        '<span class="ss-vs">FIRST TO 2</span>' +
        '<span class="ss-side ai">' + window.series.c + " MACHINE</span></div>";
}

function applySeriesToScreen(isWin) {
    if (!modeDef || !modeDef.series) return;
    var screen = document.getElementById("gameoverScreen");
    var stage = screen.querySelector(".win-stage") || screen.querySelector(".lose-stage");
    if (!stage) return;

    window.series.p += isWin ? 1 : 0;
    window.series.c += isWin ? 0 : 1;

    var actions = stage.querySelector(".go-actions");
    if (actions) actions.insertAdjacentHTML("beforebegin", seriesHtml());

    var done = window.series.p >= 2 || window.series.c >= 2;
    var champYou = window.series.p >= 2;

    if (done) {
        window.seriesLive = false;
        var banner = document.createElement("div");
        banner.className = "big-combo-banner";
        banner.textContent = champYou ? "SERIES CHAMPION!" : "MACHINE WINS THE SERIES";
        document.body.appendChild(banner);
        setTimeout(function () { banner.remove(); }, 1300);

        if (actions) {
            actions.innerHTML = '<button class="btn btn-glow gameover-btn" onclick="newSeries()">🏆 New Series</button>';
        }
        if (champYou && typeof unlockAch === "function") unlockAch("seriesWin", "Series Champion", "🏆");
    } else if (actions) {
        var first = actions.querySelector("button");
        if (first) first.textContent = "Next Round ▶";
    }
}

function newSeries() {
    window.series = { p: 0, c: 0 };
    window.seriesLive = false;
    var screen = document.getElementById("gameoverScreen");
    if (screen) { screen.classList.remove("active"); screen.innerHTML = ""; }
    if (typeof stopTurnTimer === "function") stopTurnTimer();
    if (typeof clearIdle === "function") clearIdle();
    if (typeof resetCombo === "function") resetCombo();
    startGame(goesFirst || "player");
}

/* ═══ 9b. COIN FLIP START ═══ */
function coinFlipStart() {
    if (typeof animating !== "undefined" && animating) return;
    var heads = Math.random() < 0.5;
    if (typeof toastShow === "function") {
        toastShow("🪙", heads ? "Heads!" : "Tails!", heads ? "You strike first" : "The machine strikes first");
    }
    if (typeof playTone === "function") {
        try {
            playTone(980, 0, 0.12, "triangle", 0.08);
            playTone(1320, 0.14, 0.22, "triangle", 0.07);
        } catch (e) {}
    }
    setTimeout(function () { startGame(heads ? "player" : "computer"); }, 380);
}

/* ═══ 11. CELEBRATION STYLES ═══ */
function celebrationExtras(isWin) {
    if (!isWin || !custom) return;
    var c = custom.celebration;

    if (c === "storm") {
        for (var i = 0; i < 5; i++) {
            (function (i) { setTimeout(function () { if (typeof fxLightning === "function") fxLightning(); }, i * 320); })(i);
        }
        if (typeof fxChroma === "function") fxChroma();
        setTimeout(function () {
            if (typeof spawnFxImpact === "function") {
                spawnFxImpact(window.innerWidth * 0.3, window.innerHeight * 0.4, "#7ad7ff");
                spawnFxImpact(window.innerWidth * 0.7, window.innerHeight * 0.5, "#c9a0ff");
            }
        }, 400);
    } else if (c === "royal") {
        for (var j = 0; j < 3; j++) {
            (function (j) { setTimeout(function () { if (typeof coinShower === "function") coinShower(); }, 300 + j * 500); })(j);
        }
        if (typeof spawnFireworks === "function") spawnFireworks(5);
        if (typeof confettiBurst === "function") {
            setTimeout(function () { confettiBurst(); }, 700);
            setTimeout(function () { confettiBurst(); }, 1300);
        }
    }
}

/* ═══ 12. ACHIEVEMENTS ═══ */
var ULT_ACHS = [
    { id: "undoUsed", name: "Rewind!", emoji: "🕰️" },
    { id: "emoteTalk", name: "Trash Talker", emoji: "📣" },
    { id: "masterWin", name: "Beyond Impossible", emoji: "🧬" },
    { id: "seriesWin", name: "Series Champion", emoji: "🏆" },
    { id: "mirrorWin", name: "As Above, So Below", emoji: "🪞" },
    { id: "fuseWin", name: "Bomb Squad", emoji: "💣" },
    { id: "fortuneWin", name: "Fortune Favors", emoji: "🎰" },
    { id: "konami", name: "Code of Legends", emoji: "🥷" },
    { id: "selfMade", name: "Self Made", emoji: "🧠" }
];

try {
    ULT_ACHS.forEach(function (a) {
        if (!achDefs.some(function (x) { return x.id === a.id; })) achDefs.push(a);
    });
} catch (e) {}

function ultAchChecks(isWin) {
    if (typeof unlockAch !== "function") return;
    if (!isWin) return;
    if (difficulty === "master") unlockAch("masterWin", "Beyond Impossible", "🧬");
    if (modeDef && modeDef.mirror) unlockAch("mirrorWin", "As Above, So Below", "🪞");
    if (modeDef && modeDef.fuse) unlockAch("fuseWin", "Bomb Squad", "💣");
    if (modeDef && modeDef.fortune) unlockAch("fortuneWin", "Fortune Favors", "🎰");
    if ((difficulty === "hard" || difficulty === "master") && !(custom && custom.coach)) {
        unlockAch("selfMade", "Self Made", "🧠");
    }
}

/* ═══ 13. SETTINGS ADDITIONS ═══ */
function ultChipRow(key, map) {
    var html = '<div class="ult-grid">';
    Object.keys(map).forEach(function (id) {
        var active = (custom[key] === id) ? " active" : "";
        html += '<button class="opt-chip' + active + '" data-ult="' + key + '" data-val="' + id + '" onclick="ultPick(this)">' + map[id] + "</button>";
    });
    return html + "</div>";
}

function ultSwitchRow(label, key) {
    var on = custom[key] !== false && custom[key] !== undefined ? " on" : "";
    return '<div class="switch-row"><span>' + label + '</span><button class="switch' + on + '" data-key="' + key + '" onclick="ultToggle(this)"></button></div>';
}

function ultSection(label, inner) {
    var d = document.createElement("div");
    d.className = "set-section";
    d.innerHTML = '<div class="set-label">' + label + "</div>" + inner;
    return d;
}

function appendUltimateSettings() {
    var body = document.getElementById("settingsBody");
    if (!body) return;

    body.appendChild(ultSection("Coach — highlight the smart move",
        ultSwitchRow("Show coach hints (in game)", "coach") +
        '<div class="set-label mini">Tip: the 🧭 Coach chip on the board toggles this mid-game.</div>'));

    body.appendChild(ultSection("Comfort",
        ultSwitchRow("Calm mode (less motion & flashes)", "calm")));

    body.appendChild(ultSection("Cursor trail style", ultChipRow("trailStyle", TRAIL_STYLES)));
    body.appendChild(ultSection("Victory celebration", ultChipRow("celebration", CELEBRATIONS)));
    body.appendChild(ultSection("Music mood", ultChipRow("music", MUSIC_MOODS)));
}

function ultPick(btn) {
    var key = btn.getAttribute("data-ult");
    var val = btn.getAttribute("data-val");
    if (!key) return;
    custom[key] = val;
    saveCustom();
    applyCustom();
    document.querySelectorAll('[data-ult="' + key + '"]').forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-val") === val);
    });
    if (typeof sfxHover === "function") sfxHover();
}

function ultToggle(btn) {
    var key = btn.getAttribute("data-key");
    if (!key) return;
    custom[key] = (custom[key] === undefined || custom[key] === false);
    saveCustom();
    applyCustom();
    document.querySelectorAll('[data-key="' + key + '"]').forEach(function (b) {
        b.classList.toggle("on", custom[key] === true);
    });

    /* Live update the coach chip / board */
    if (key === "coach" && window.currentScreen === "play" && !gameOver) {
        var box = document.getElementById("gameBox");
        if (box) render(box);
    }
    if (typeof sfxHover === "function") sfxHover();
}

/* ═══ 14. SECRET CODE (Konami) ═══ */
var KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
var konamiIdx = 0;

function checkKonami(e) {
    var key = e.key;
    if (key === KONAMI[konamiIdx] || key.toLowerCase() === KONAMI[konamiIdx]) {
        konamiIdx++;
        if (konamiIdx >= KONAMI.length) {
            konamiIdx = 0;
            grantPrism();
        }
    } else {
        konamiIdx = (key === KONAMI[0]) ? 1 : 0;
    }
}

function grantPrism() {
    if (progress.prism) {
        if (typeof toastShow === "function") toastShow("🥷", "Code accepted", "Prism skin already unlocked");
        return;
    }
    progress.prism = true;
    saveProgress();
    if (typeof addXp === "function") addXp(400);
    if (typeof unlockAch === "function") unlockAch("konami", "Code of Legends", "🥷");
    if (typeof toastShow === "function") toastShow("🌈", "PRISM SKIN UNLOCKED!", "Enter the code, reap the colors");
    if (typeof spawnFireworks === "function") spawnFireworks(6);
    if (typeof spawnConfetti === "function") spawnConfetti();
    if (typeof playWinFanfare === "function") playWinFanfare();
    if (typeof fxShake === "function") fxShake("shake-hard", 500);
}

/* ═══ 15. WRAPPERS (hook into the existing engine) ═══ */

/* ── Render extras ── */
var _render = render;
render = function (box) {
    _render(box);
    try { afterRender(box); } catch (e) {}
};

/* ── Undo snapshots + mirror guard ── */
var _take = take;
take = function (n) {
    if (modeDef && modeDef.mirror) {
        var allowed = mirrorAllowed();
        if (allowed && n !== allowed) {
            if (typeof toastShow === "function") toastShow("🪞", "Mirror mode", "You must take exactly " + allowed);
            if (typeof playTone === "function") { try { playTone(180, 0, 0.15, "square", 0.06, 120); } catch (e) {} }
            return;
        }
    }
    if (!gameOver && playersTurn && !animating) pushUndo();
    return _take(n);
};

/* ── Capture the rival's take for Mirror mode ── */
var _computerTurn = computerTurn;
computerTurn = function () {
    var before = sticks;
    _computerTurn();
    try {
        var taken = before - sticks;
        if (modeDef && modeDef.mirror && taken > 0) window.oppLastTake = taken;
    } catch (e) {}
};

/* ── Move completion → fuse / fortune ── */
var _animateRemoval = animateRemoval;
animateRemoval = function (count, callback) {
    _animateRemoval(count, function () {
        callback();
        try { afterMove(); } catch (e) {}
    });
};

/* ── New game setup ── */
var _startGame = startGame;
startGame = function (first) {
    window.undoStack = [];
    window.undosLeft = 1;
    window.oppLastTake = 0;
    window.fuseMoves = 0;
    if (modeDef && modeDef.series) {
        if (!window.seriesLive) {
            window.series = { p: 0, c: 0 };
            window.seriesLive = true;
        }
    } else {
        window.seriesLive = false;
    }
    var out = _startGame(first);
    if (modeDef && modeDef.fortune) rollFortune(false);
    return out;
};

/* ── Mode picking resets the series ── */
var _chooseMode = chooseMode;
chooseMode = function (id) {
    window.seriesLive = false;
    _chooseMode(id);
};

/* ── Game over: series, achievements, celebration style ── */
var _showGameOverScreen = showGameOverScreen;
showGameOverScreen = function (isWin, lostStreak) {
    _showGameOverScreen(isWin, lostStreak);
    try {
        applySeriesToScreen(isWin);
        ultAchChecks(isWin);
        celebrationExtras(isWin);
    } catch (e) {}
};

/* ── Settings ── */
var _openSettings = openSettings;
openSettings = function () {
    _openSettings();
    appendUltimateSettings();
};

/* ── Skin gating (Prism = secret code) ── */
var _setSkin = setSkin;
setSkin = function (id) {
    if (id === "prism") {
        if (!progress.prism) {
            if (typeof toastShow === "function") toastShow("🔒", "Locked skin", "Some say a famous code awakens it…");
            return;
        }
        custom.skin = id;
        saveCustom();
        applyCustom();
        refreshSettingsActive();
        if (typeof sfxHover === "function") sfxHover();
        return;
    }
    _setSkin(id);
};

/* ── Custom weather types ── */
var _spawnWP = spawnWeatherParticle;
spawnWeatherParticle = function (box, type) {
    if (type !== "petals" && type !== "sparks") return _spawnWP(box, type);
    if (!box) return;

    var el = document.createElement("div");
    el.className = "wp " + (type === "petals" ? "wp-petal" : "wp-spark");
    var dur = 7 + Math.random() * 7;
    el.style.left = Math.random() * 100 + "vw";
    el.style.animationDuration = dur + "s";
    el.style.animationDelay = (-Math.random() * dur) + "s";
    el.style.setProperty("--sway", (Math.random() * 140 - 70) + "px");
    el.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
    if (type === "petals") {
        var s = Math.random() * 7 + 8;
        el.style.width = s + "px";
        el.style.height = s + "px";
        el.style.opacity = 0.55 + Math.random() * 0.4;
    } else {
        el.style.opacity = 0.5 + Math.random() * 0.5;
    }
    box.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, (dur + 2) * 1000);
};

/* ── Cursor trail styles ── */
var _initTrail = initTrail;
initTrail = function () {
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    var last = 0;
    document.addEventListener("pointermove", function (e) {
        if (!custom.trail || custom.trailStyle === "off") return;
        var now = Date.now();
        if (now - last < 38) return;
        last = now;
        var layer = document.getElementById("cursorTrail");
        if (!layer) return;
        var d = document.createElement("div");
        d.className = "trail-dot" + (custom.trailStyle && custom.trailStyle !== "dot" ? " t-" + custom.trailStyle : "");
        d.style.left = e.clientX + "px";
        d.style.top = e.clientY + "px";
        layer.appendChild(d);
        setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 720);
    });
};

/* ── Apply the extra preferences ── */
var _applyCustom = applyCustom;
applyCustom = function () {
    _applyCustom();
    document.body.classList.toggle("calm", !!(custom && custom.calm));
    document.body.setAttribute("data-trail", (custom && custom.trailStyle) || "dot");
};

/* ── Calm mode tames the screen shake ── */
var _fxShake = fxShake;
fxShake = function (cls, ms) {
    if (custom && custom.calm) return;
    _fxShake(cls, ms);
};

/* ── Music mood ── */
var _startMusic = startMusic;
startMusic = function () {
    if (custom && custom.music === "off") return;
    _startMusic();
    try {
        if (!musicNodes) return;
        if (custom.music === "pulse") {
            var freqs = [82.41, 123.47, 164.81];
            musicNodes.oscs.forEach(function (o, i) {
                o.type = "sawtooth";
                o.frequency.value = freqs[i] || 110;
            });
            musicNodes.lfo.frequency.value = 2.2;
        }
    } catch (e) {}
};

/* ═══ 16. KEYS ═══ */
function initUltKeys() {
    document.addEventListener("keydown", function (e) {
        if (document.body.classList.contains("cine-on")) return;
        checkKonami(e);

        var tag = (e.target && e.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA") return;

        var k = (e.key || "").toLowerCase();
        if (k === "escape") { closeEmotes(); return; }
        if (k === "t" || k === "e") { toggleEmotes(); return; }
        if (k === "u") { undoMove(); return; }
    });

    document.addEventListener("click", function (e) {
        var wheel = document.getElementById("emoteWheel");
        if (!wheel) return;
        if (wheel.classList.contains("open") &&
            !e.target.closest("#emoteWheel") &&
            !e.target.closest("#emoteBtn")) {
            closeEmotes();
        }
    });
}

/* ═══ 17. BOOT ═══ */
window.addEventListener("DOMContentLoaded", function () {
    buildEmoteWheel();
    initUltKeys();
    applyCustom();
});
