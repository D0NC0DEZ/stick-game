(function () {
    "use strict";

    var claimed = false;
    var finished = false;
    var cb = null;
    var timers = [];

    function el(id) { return document.getElementById(id); }

    function wait(ms) {
        return new Promise(function (resolve) { timers.push(setTimeout(resolve, ms)); });
    }

    /* ── Sound helpers (safe: silent until audio context is running) ── */
    function tone(freq, start, dur, type, vol, slideTo) {
        if (typeof getAudio !== "function" || typeof playTone !== "function") return;
        var ctx = getAudio();
        if (!ctx || ctx.state !== "running") return;
        try { playTone(freq, start, dur, type, vol, slideTo); } catch (e) {}
    }

    function sfxLineIn() { tone(300, 0, 0.55, "sine", 0.05, 720); }
    function sfxLineOut() { tone(560, 0, 0.4, "sine", 0.04, 220); }

    function sfxBoom() {
        tone(52, 0, 1.4, "sine", 0.3, 34);
        tone(70, 0.05, 1.0, "sawtooth", 0.12, 42);
    }

    function sfxSlam() {
        tone(46, 0, 1.6, "sine", 0.34, 30);
        tone(120, 0, 0.7, "square", 0.1, 60);
        tone(900, 0, 0.3, "triangle", 0.09, 240);
    }

    function sfxShimmer() {
        tone(523.25, 0, 0.7, "triangle", 0.07);
        tone(659.25, 0.12, 0.7, "triangle", 0.07);
        tone(783.99, 0.24, 0.8, "sine", 0.06);
    }

    function letters(text) {
        var html = "";
        for (var i = 0; i < text.length; i++) {
            var ch = text[i] === " " ? "&nbsp;" : text[i];
            html += '<span class="ct-letter" style="animation-delay:' + (i * 0.065).toFixed(3) + 's">' + ch + "</span>";
        }
        return html;
    }

    /* ── Text card ── */
    async function card(id, hold, sfx) {
        if (finished) return;
        var e = el(id);
        if (!e) return;
        e.classList.add("on");
        if (sfx) sfx(); else sfxLineIn();
        await wait(hold);
        if (finished) return;
        e.classList.remove("on");
        e.classList.add("off");
        sfxLineOut();
        await wait(480);
        e.classList.remove("off");
    }

    function flash(white) {
        var f = el("cineFlash");
        if (!f) return;
        f.classList.remove("go", "white");
        void f.offsetWidth;
        if (white) f.classList.add("white");
        f.classList.add("go");
    }

    function showTitle() {
        var wrap = el("cineTitleWrap");
        var t = el("cineTitle");
        var cine = el("cine");
        if (!wrap || !t) return;
        t.innerHTML = letters("STICK GAME");
        wrap.classList.add("on");

        var ring = el("cineRing");
        if (ring) { ring.classList.remove("boom"); void ring.offsetWidth; ring.classList.add("boom"); }
        var ring2 = el("cineRing2");
        if (ring2) { ring2.classList.remove("boom"); void ring2.offsetWidth; ring2.classList.add("boom"); }

        flash(true);

        if (cine) {
            cine.classList.remove("shake");
            void cine.offsetWidth;
            cine.classList.add("shake");
        }
        burstFx(window.innerWidth / 2, window.innerHeight / 2, 90);
        burstEmbers(16);
        sfxSlam();
    }

    /* ══ Extra beats ══ */

    async function creditsCard() {
        if (finished) return;
        var c = el("cineCredits");
        if (!c) return;
        c.classList.add("on");
        tone(246.94, 0, 0.6, "sine", 0.05, 493.88);
        tone(311.13, 0.18, 0.6, "triangle", 0.04, 622.25);
        await wait(2200); if (finished) return;
        c.classList.remove("on");
        c.classList.add("off");
        sfxLineOut();
        await wait(460); if (finished) return;
        c.classList.remove("off");
    }

    async function ratingCard() {
        if (finished) return;
        var r = el("cineRating");
        if (!r) return;
        r.classList.add("on");
        tone(72, 0, 0.5, "square", 0.13, 44);
        tone(160, 0.04, 0.35, "sawtooth", 0.08, 70);
        await wait(1350); if (finished) return;
        r.classList.remove("on");
        r.classList.add("off");
        await wait(440); if (finished) return;
        r.classList.remove("off");
    }

    /* ══ Floating embers ══ */
    function burstEmbers(n) {
        var box = el("cineEmbers");
        if (!box) return;
        for (var i = 0; i < (n || 10); i++) {
            var s = document.createElement("i");
            s.className = "pop";
            s.style.left = (20 + Math.random() * 60) + "%";
            s.style.top = (38 + Math.random() * 24) + "%";
            s.style.setProperty("--sz", (Math.random() * 3.5 + 2) + "px");
            s.style.animationDuration = (0.9 + Math.random() * 0.9) + "s";
            box.appendChild(s);
            (function (node) { setTimeout(function () { node.remove(); }, 2000); })(s);
        }
    }

    function spawnEmbers() {
        var box = el("cineEmbers");
        if (!box || box.childElementCount) return;
        for (var i = 0; i < 26; i++) {
            var s = document.createElement("i");
            s.style.left = (Math.random() * 100) + "%";
            s.style.animationDuration = (7 + Math.random() * 9) + "s";
            s.style.animationDelay = (-Math.random() * 12) + "s";
            s.style.setProperty("--sz", (Math.random() * 3 + 1.2) + "px");
            box.appendChild(s);
        }
    }

    /* ══ Intro particle field (canvas) ══ */
    var fxCanvas = null, fxCtx = null, fxRaf = null;
    var fxAmbient = [], fxBursts = [];

    function initFx() {
        fxCanvas = el("cineFx");
        if (!fxCanvas || !fxCanvas.getContext) return;
        fxCtx = fxCanvas.getContext("2d");

        function size() {
            fxCanvas.width = window.innerWidth;
            fxCanvas.height = window.innerHeight;
        }
        size();
        window.addEventListener("resize", size);

        for (var i = 0; i < 54; i++) {
            fxAmbient.push({
                x: Math.random(), y: Math.random(),
                r: Math.random() * 1.7 + 0.4,
                vy: -(Math.random() * 0.00035 + 0.00008),
                vx: (Math.random() - 0.5) * 0.00025,
                a: Math.random() * 0.45 + 0.12,
                tw: Math.random() * Math.PI * 2
            });
        }
        loopFx();
    }

    function burstFx(cx, cy, n) {
        if (!fxCtx) return;
        n = n || 60;
        for (var i = 0; i < n; i++) {
            var ang = (Math.PI * 2 * i) / n + Math.random() * 0.3;
            var sp = Math.random() * 6 + 2.4;
            fxBursts.push({
                x: cx, y: cy,
                vx: Math.cos(ang) * sp,
                vy: Math.sin(ang) * sp - 1.2,
                life: 1,
                decay: Math.random() * 0.014 + 0.011,
                r: Math.random() * 2.4 + 1
            });
        }
    }

    function loopFx() {
        if (!fxCtx || !fxCanvas) return;
        var w = fxCanvas.width, h = fxCanvas.height;
        fxCtx.clearRect(0, 0, w, h);

        var i, p;
        for (i = 0; i < fxAmbient.length; i++) {
            p = fxAmbient[i];
            p.x += p.vx; p.y += p.vy; p.tw += 0.03;
            if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
            if (p.x < -0.05) p.x = 1.05;
            if (p.x > 1.05) p.x = -0.05;
            var a = p.a * (0.55 + 0.45 * Math.sin(p.tw));
            fxCtx.beginPath();
            fxCtx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
            fxCtx.fillStyle = "rgba(255,224,170," + a.toFixed(3) + ")";
            fxCtx.fill();
        }

        for (i = fxBursts.length - 1; i >= 0; i--) {
            p = fxBursts[i];
            p.x += p.vx; p.y += p.vy;
            p.vy += 0.11; p.vx *= 0.985; p.vy *= 0.985;
            p.life -= p.decay;
            if (p.life <= 0) { fxBursts.splice(i, 1); continue; }
            fxCtx.beginPath();
            fxCtx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
            fxCtx.fillStyle = "rgba(255," + Math.floor(180 + p.life * 70) + "," + Math.floor(90 + p.life * 130) + "," + p.life.toFixed(3) + ")";
            fxCtx.fill();
        }

        fxRaf = requestAnimationFrame(loopFx);
    }


    /* ══ Gameplay montage — quick-cut footage reel (Marvel cards × Sonic speed) ══ */
    var mgBuilt = false;
    var mgIntervals = [];

    function mgClearTimers() {
        mgIntervals.forEach(clearInterval);
        mgIntervals = [];
    }

    function sfxCut() {
        tone(240, 0, 0.22, "sawtooth", 0.05, 980);
        tone(880, 0.06, 0.16, "triangle", 0.04, 260);
    }

    function sfxSnap() { tone(1300, 0, 0.09, "square", 0.09, 380); tone(180, 0, 0.18, "triangle", 0.07, 90); }
    function sfxBeep() { tone(740, 0, 0.1, "square", 0.05); tone(980, 0.14, 0.1, "square", 0.05); tone(1240, 0.28, 0.12, "square", 0.05); }
    function sfxFuseHit() {
        tone(70, 0, 0.9, "sine", 0.22, 40);
        tone(420, 0, 0.24, "sawtooth", 0.08, 120);
    }
    function sfxVictory() {
        tone(523.25, 0, 0.16, "triangle", 0.07);
        tone(659.25, 0.14, 0.16, "triangle", 0.07);
        tone(783.99, 0.28, 0.3, "triangle", 0.08);
        tone(1046.5, 0.44, 0.5, "sine", 0.07);
    }

    function mgSticks(n, fly) {
        var html = "", i;
        for (i = 0; i < n; i++) {
            var t = n > 1 ? i / (n - 1) : 0.5;
            var left = 5 + t * 84 + (((i * 37) % 5) - 2);
            var bottom = 8 + ((i * 53) % 16);
            var rot = ((i * 29) % 46) - 23;
            html += '<i style="left:' + left.toFixed(1) + '%;bottom:' + bottom + '%;--r:' + rot + 'deg"></i>';
        }
        if (fly) {
            html += '<i class="fly" style="left:72%;bottom:22%;--r:14deg"></i>';
            html += '<i class="fly" style="left:85%;bottom:11%;--r:-9deg;animation-delay:.42s"></i>';
        }
        return html;
    }

    function mgCode() {
        var html = "", i;
        for (i = 0; i < 16; i++) {
            var left = ((i * 61) % 94) + 2;
            var dur = 2.2 + ((i * 17) % 22) / 10;
            var delay = -((i * 23) % 30) / 10;
            var txt = ["21", "19", "17", "-2", "15", "WIN?", "13", "11", "ODDS", "9", "7", "5", "3", "1", "GG", "LAST"];
            html += '<span style="left:' + left + '%;animation-duration:' + dur + 's;animation-delay:' + delay + 's">' + txt[i % txt.length] + "</span>";
        }
        return html;
    }

    function mgCap(text) { return '<div class="mg-cap">' + text + "</div>"; }

    function buildMontage() {
        var m = el("cineMontage");
        if (!m || mgBuilt) return;
        mgBuilt = true;
        m.innerHTML =
            '<div class="mg-speed" id="mgSpeed"></div>' +
            '<div class="mg-rec"><i></i> GAMEPLAY REEL &mdash; CAM 01</div>' +

            /* 1 — the pile */
            '<div class="mg-clip r-warm">' +
                '<div class="mg-board">' +
                    '<div class="mg-hud"><b>21</b><small>STICKS LEFT</small></div>' +
                    '<div class="mg-pile">' + mgSticks(21, false) + "</div>" +
                "</div>" +
                mgCap("Every game begins with <b>21</b>") +
            "</div>" +

            /* 2 — the take */
            '<div class="mg-clip r-warm2">' +
                '<div class="mg-board">' +
                    '<div class="mg-hud"><b>21</b><small>STICKS LEFT</small></div>' +
                    '<div class="mg-pile">' + mgSticks(19, true) + "</div>" +
                "</div>" +
                '<div class="mg-chip">&minus;2</div>' +
                mgCap("Take one. <b>Take two.</b>") +
            "</div>" +

            /* 3 — the machine */
            '<div class="mg-clip r-ice">' +
                '<div class="mg-code">' + mgCode() + "</div>" +
                '<div class="mg-eye"><i></i></div>' +
                mgCap("The machine <b>doesn&rsquo;t blink</b>") +
            "</div>" +

            /* 4 — the fuse */
            '<div class="mg-clip r-blood">' +
                '<div class="mg-cd" id="mgCd">3</div>' +
                '<div class="mg-fuserail"><i></i></div>' +
                mgCap("The fuse <b>always burns</b>") +
            "</div>" +

            /* 5 — the modes */
            '<div class="mg-clip r-night">' +
                '<div class="mg-tiles">' +
                    '<div class="mg-tile"><span>&#129694;</span><small>MIRROR</small></div>' +
                    '<div class="mg-tile"><span>&#127183;</span><small>FORTUNE</small></div>' +
                    '<div class="mg-tile"><span>&#128163;</span><small>FUSE</small></div>' +
                    '<div class="mg-tile"><span>&#127942;</span><small>SERIES</small></div>' +
                "</div>" +
                mgCap("Seventeen ways to <b>suffer</b>") +
            "</div>" +

            /* 6 — the crown */
            '<div class="mg-clip r-gold">' +
                '<div class="mg-conf"></div>' +
                '<div class="mg-trophy">&#127942;</div>' +
                mgCap("Only one <b>walks away</b>") +
            "</div>";
    }

    function mgPop(node, cls) {
        if (!node) return;
        node.classList.remove(cls);
        void node.offsetWidth;
        node.classList.add(cls);
    }

    function enterTake(clip) {
        var hud = clip.querySelector(".mg-hud b");
        if (!hud) return;
        var iv = setInterval(function () {
            hud.textContent = "19";
            mgClearTimers();
        }, 420);
        mgIntervals.push(iv);
    }

    function enterFuse() {
        var cd = el("mgCd");
        var seq = ["3", "2", "1"];
        for (var i = 0; i < seq.length; i++) {
            (function (n, d) {
                timers.push(setTimeout(function () {
                    if (finished || !cd) return;
                    cd.textContent = n;
                    mgPop(cd, "pop");
                    if (n === "1") sfxFuseHit(); else tone(560 - n * 90, 0, 0.14, "square", 0.07, 300);
                }, d));
            })(seq[i], 240 + i * 380);
        }
        timers.push(setTimeout(function () {
            if (finished) return;
            flash(true);
            burstFx(window.innerWidth / 2, window.innerHeight * 0.45, 70);
            burstEmbers(12);
            var cineEl = el("cine");
            if (cineEl) { cineEl.classList.remove("shake"); void cineEl.offsetWidth; cineEl.classList.add("shake"); }
        }, 1180));
    }

    function enterWin(clip) {
        var box = clip.querySelector(".mg-conf");
        if (!box || box.childElementCount) return;
        var cols = ["#ffd166", "#ff5f8f", "#66d9ff", "#a78bfa", "#7CFC9B", "#ff9a3c"];
        for (var i = 0; i < 34; i++) {
            var p = document.createElement("i");
            p.style.left = ((i * 53) % 98) + "%";
            p.style.background = cols[i % cols.length];
            p.style.animationDuration = (1.1 + ((i * 19) % 14) / 10) + "s";
            p.style.animationDelay = (((i * 7) % 14) / 10) + "s";
            box.appendChild(p);
        }
    }

    var MG = [
        { dur: 1450, sfx: function () { tone(180, 0, 0.5, "sine", 0.05, 360); } },
        { dur: 1450, enter: enterTake, sfx: sfxSnap },
        { dur: 1400, sfx: sfxBeep },
        { dur: 1550, enter: enterFuse, sfx: function () { tone(160, 0, 0.7, "sawtooth", 0.05, 70); } },
        { dur: 1550, sfx: sfxShimmer },
        { dur: 1650, enter: enterWin, sfx: sfxVictory }
    ];

    async function playMontage() {
        if (finished) return;
        buildMontage();
        var m = el("cineMontage");
        if (!m || !m.childElementCount) return;
        var clips = m.querySelectorAll(".mg-clip");
        if (!clips.length) return;
        m.classList.add("on");

        for (var i = 0; i < clips.length && i < MG.length; i++) {
            if (finished) return;
            mgClearTimers();
            var prev = m.querySelector(".mg-clip.on");
            if (prev) prev.classList.remove("on");
            void m.offsetWidth;

            clips[i].classList.add("on");
            var sp = el("mgSpeed");
            if (sp) { sp.classList.remove("go"); void sp.offsetWidth; sp.classList.add("go"); }
            flash(i % 2 === 1);
            sfxCut();
            if (MG[i].sfx) MG[i].sfx();
            if (MG[i].enter) MG[i].enter(clips[i]);

            await wait(MG[i].dur);
        }

        if (finished) return;
        mgClearTimers();
        var last = m.querySelector(".mg-clip.on");
        if (last) last.classList.remove("on");
        flash(true);
        m.classList.remove("on");
        await wait(300);
    }

    /* ── Main timeline ── */
    async function run() {
        var cine = el("cine");
        if (!cine) { finish(); return; }

        document.body.classList.add("cine-on");
        initFx();
        spawnEmbers();
        var prog = el("cineProg");
        if (prog) { prog.classList.remove("go"); void prog.offsetWidth; prog.classList.add("go"); }
        requestAnimationFrame(function () { cine.classList.add("active"); });

        await wait(1100); if (finished) return;

        /* Studio logo — "presents" */
        await card("cineStudio", 1450, sfxShimmer); if (finished) return;
        await wait(320); if (finished) return;

        await card("cineL1", 1550); if (finished) return;
        await wait(220); if (finished) return;
        await card("cineL2", 1550); if (finished) return;
        await wait(220); if (finished) return;

        /* ── Quick-cut gameplay footage reel ── */
        await playMontage(); if (finished) return;

        /* The rule — red beat with flash + boom + glitch */
        var l3 = el("cineL3");
        if (l3) {
            l3.classList.add("on", "glitching");
            sfxLineIn();
            await wait(700); if (finished) return;
            flash(false);
            sfxBoom();
            burstEmbers(10);
            await wait(1350); if (finished) return;
            l3.classList.remove("on", "glitching");
            l3.classList.add("off");
            await wait(480);
            l3.classList.remove("off");
        }

        await wait(260); if (finished) return;

        /* Cast credits */
        await creditsCard(); if (finished) return;
        await wait(220); if (finished) return;

        /* Rating card */
        await ratingCard(); if (finished) return;
        await wait(240); if (finished) return;

        showTitle();
        await wait(3400);
        finish();
    }

    /* ── End / hand off to the loader ── */
    function finish() {
        if (finished) return;
        finished = true;
        mgClearTimers();
        timers.forEach(clearTimeout);
        timers = [];

        var cine = el("cine");
        var done = cb;
        cb = null;

        if (!cine) {
            document.body.classList.remove("cine-on");
            if (done) done();
            return;
        }

        cine.classList.add("closing");
        cine.classList.add("fade-out");
        if (fxRaf) { cancelAnimationFrame(fxRaf); fxRaf = null; }
        setTimeout(function () {
            document.body.classList.remove("cine-on");
            cine.remove();
            if (done) done();
        }, 950);
    }

    window.playCinematic = function (callback) {
        if (claimed) { if (callback) callback(); return; }
        claimed = true;
        cb = callback || null;

        var cine = el("cine");
        if (!cine) { finish(); return; }

        var skip = el("cineSkip");
        if (skip) {
            skip.addEventListener("click", function (e) {
                e.stopPropagation();
                finish();
            });
        }

        var soundBtn = el("cineSoundBtn");
        if (soundBtn) {
            soundBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                if (typeof getAudio === "function") {
                    try {
                        var c = getAudio();
                        if (c && c.state === "suspended") c.resume().catch(function () {});
                    } catch (err) {}
                }
                if (typeof playTone === "function") { try { playTone(660, 0, 0.18, "triangle", 0.1); } catch (err) {} }
                soundBtn.classList.add("armed");
                setTimeout(function () { soundBtn.remove(); }, 600);
                var hint = el("cineHint");
                if (hint) hint.classList.add("gone");
            });
        }

        document.addEventListener("keydown", function () {
            if (!finished) finish();
        });

        document.addEventListener("pointerdown", function armAudio() {
            if (typeof getAudio === "function") {
                try { getAudio(); } catch (e) {}
            }
            var hint = el("cineHint");
            if (hint) hint.classList.add("gone");
        });

        run();
    };
})();
