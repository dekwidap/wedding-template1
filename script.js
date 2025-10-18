document.addEventListener("DOMContentLoaded", () => {
    const targets = document.querySelectorAll(".guest-name");
    if (!targets.length) return;

    const params = new URLSearchParams(window.location.search);
    let to = params.get("to"); // ex: ?to=Dekwid%20Aryama%20Putra
    if (to == null) return; // tanpa param: biarkan default di HTML

    // Decode & rapikan
    to = to.replace(/\+/g, " "); // dukung ?to=Nama+Tamu
    try {
        to = decodeURIComponent(to);
    } catch (e) {}
    to = to.replace(/[_-]+/g, " "); // ganti _ atau - jadi spasi
    to = to.trim().replace(/\s{2,}/g, " ");

    // (opsional) Title Case — hapus komentar kalau mau otomatis kapital awal kata
    // to = to.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());

    if (to) {
        if (to.length > 80) to = to.slice(0, 80) + "…"; // cegah nama terlalu panjang
        targets.forEach((el) => (el.textContent = to)); // aman dari XSS
    }
});

// === GANTI TANGGAL DI SINI ===
// Format ISO dengan zona waktu WITA (UTC+08:00):
const EVENT_DATE = new Date("2025-11-07T08:00:00+08:00");
// ==============================

const elDays = document.getElementById("cd-days");
const elHours = document.getElementById("cd-hours");
const elMins = document.getElementById("cd-mins");
const elSecs = document.getElementById("cd-secs");

function pad(n) {
    return n.toString().padStart(2, "0");
}

function tick() {
    const now = new Date().getTime();
    const diff = EVENT_DATE.getTime() - now;

    if (diff <= 0) {
        elDays.textContent = "00";
        elHours.textContent = "00";
        elMins.textContent = "00";
        elSecs.textContent = "00";
        return; // selesai
    }

    const sec = Math.floor(diff / 1000);
    const days = Math.floor(sec / 86400);
    const hrs = Math.floor((sec % 86400) / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;

    elDays.textContent = pad(days);
    elHours.textContent = pad(hrs);
    elMins.textContent = pad(mins);
    elSecs.textContent = pad(secs);
}

tick();
setInterval(tick, 1000);

(function () {
    const items = Array.from(document.querySelectorAll(".masonry-item img"));
    if (!items.length) return;

    const modal = document.getElementById("lightbox");
    const imgEl = modal.querySelector(".lb-img");
    const capEl = modal.querySelector(".lb-caption");
    const btnPrev = modal.querySelector(".lb-prev");
    const btnNext = modal.querySelector(".lb-next");
    const btnClose = modal.querySelector(".lb-close");

    let idx = 0;
    let startX = 0,
        startY = 0,
        startT = 0;

    const hintEl = modal.querySelector(".lb-hint");

    // helper: set gambar
    function showAt(i) {
        idx = (i + items.length) % items.length;
        const img = items[idx];
        const full = img.getAttribute("data-full") || img.getAttribute("src");
        imgEl.src = full;
        imgEl.alt = img.alt || "";
        capEl.textContent = img.alt || "";
        // preload tetangga
        preload(idx + 1);
        preload(idx - 1);
    }

    function preload(i) {
        const t = (i + items.length) % items.length;
        const s =
            items[t].getAttribute("data-full") || items[t].getAttribute("src");
        const pic = new Image();
        pic.src = s;
    }

    function showHintIfMobile() {
        if (!hintEl) return;
        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        // Desktop: biarin hidden via CSS; Mobile: pastikan ON
        if (isMobile) hintEl.classList.remove("off");
        else hintEl.classList.add("off");
    }

    function open(i) {
        showAt(i);
        modal.classList.add("open");
        document.body.classList.add("no-scroll");
        modal.setAttribute("aria-hidden", "false");
        btnClose.focus();
        // close saat klik area gelap (bukan tombol/gambar)
        modal.addEventListener("click", onBackdrop);
        document.addEventListener("keydown", onKey);

        // 🔻 aktifkan gestur sentuh
        modal.addEventListener("touchstart", onTouchStart, { passive: true });
        modal.addEventListener("touchend", onTouchEnd);
        // 🎯 tampilkan hint di mobile
        showHintIfMobile();
    }

    function close() {
        modal.classList.remove("open");
        document.body.classList.remove("no-scroll");
        modal.setAttribute("aria-hidden", "true");
        modal.removeEventListener("click", onBackdrop);
        document.removeEventListener("keydown", onKey);

        // 🔻 lepas gestur sentuh
        modal.removeEventListener("touchstart", onTouchStart);
        modal.removeEventListener("touchend", onTouchEnd);
    }

    function onBackdrop(e) {
        const targets = [imgEl, btnPrev, btnNext, btnClose, capEl];
        if (!targets.includes(e.target)) close();
    }

    function onKey(e) {
        if (e.key === "Escape") close();
        else if (e.key === "ArrowRight") showAt(idx + 1);
        else if (e.key === "ArrowLeft") showAt(idx - 1);
    }

    function onTouchStart(e) {
        const t = e.touches && e.touches[0];
        if (!t) return;
        startX = t.clientX;
        startY = t.clientY;
        startT = Date.now();
    }
    function onTouchEnd(e) {
        const t = e.changedTouches && e.changedTouches[0];
        if (!t) return;
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        const dt = Date.now() - startT;

        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        // Threshold sederhana
        const SWIPE_X = 60; // geser horizontal ≥60px
        const SWIPE_Y = 90; // geser vertikal ≥90px
        const MAX_TIME = 800; // < 0.8s terasa "swipe"

        // Swipe horizontal: next/prev
        if (dt <= MAX_TIME && absX > SWIPE_X && absX > absY) {
            if (dx < 0) showAt(idx + 1); // kiri -> next
            else showAt(idx - 1); // kanan -> prev
            return;
        }

        // Swipe vertical: close
        if (absY > SWIPE_Y && absY > absX) {
            close();
        }
    }
    // events pada thumbnail
    items.forEach((img, i) => {
        img.addEventListener("click", () => open(i));
        img.setAttribute("tabindex", "0"); // bisa fokus via keyboard
        img.addEventListener("keydown", (e) => {
            // Enter/Space untuk buka
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(i);
            }
        });
    });

    // tombol
    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", () => showAt(idx - 1));
    btnNext.addEventListener("click", () => showAt(idx + 1));
})();

const guests = document.getElementById("guests");
guests.addEventListener("input", () => {
    const v = parseInt(guests.value, 10);
    if (Number.isNaN(v)) return;
    if (v < 1) guests.value = 1;
    if (v > 5) guests.value = 5;
});

const GAS_URL =
    "https://script.google.com/macros/s/AKfycbz6BQ0EnCoBzUPc0OzmIC6KS82UTUOFHDzhlt43-FlE6ILrbeeybgxt9B1OSgqUK7kU/exec"; // ⬅️ ganti

// helper query
const $ = (sel) => document.querySelector(sel);

// (opsional) toggle input guests sesuai konfirmasi
(function setupGuestsToggle() {
    const sel = $("#confirmation");
    const g = $("#guests");
    if (!sel || !g) return;
    function apply() {
        if (sel.value === "not_attending") {
            g.value = "";
            g.disabled = true;
            g.placeholder = "—";
        } else {
            g.disabled = false;
            g.placeholder = "e.g. 2";
        }
    }
    sel.addEventListener("change", apply);
    apply();
})();

// ➜ SATU FUNCTION untuk proses
async function processRSVP() {
    const name = $("#guestName")?.value.trim() || "";
    const conf = $("#confirmation")?.value || "";
    const wishes = $("#wishes")?.value.trim() || "";
    const guestsEl = $("#guests");

    // validasi
    if (!name) {
        Toast.show("Please enter your name.", "error");
        return;
    }
    if (!conf) {
        Toast.show("Please choose your confirmation.", "error");
        return;
    }

    let guests = 0;
    if (conf === "attending") {
        const v = parseInt(guestsEl?.value || "0", 10);
        if (!Number.isFinite(v) || v < 1 || v > 5) {
            Toast.show("Number of Guests must be 1–5.", "error");
            return;
        }
        guests = v;
    }

    const payload = {
        name,
        confirmation: conf,
        guests,
        wishes,
        ts: new Date().toISOString(),
    };

    // Toast loading
    const toast = Toast.show("Sending RSVP & Wishes…", "info", {
        persist: true,
        loading: true,
    });

    // UI tombol ringan
    const btn = document.getElementById("btn-rsvp");
    const old = btn?.textContent;
    btn?.classList.add("is-loading");
    if (btn) btn.textContent = "Sending…";

    try {
        const body = new URLSearchParams(payload).toString();
        await fetch(GAS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });

        if (wishes) addWishToData({ name, wishes });

        // sukses
        toast.update("Sent! Thank you.", "success", { autohide: 2200 });
        document.getElementById("rsvp-form")?.reset();
        const ev = new Event("change");
        $("#confirmation")?.dispatchEvent(ev);
    } catch (e) {
        console.error(e);
        toast.update("Send failed. Please try again.", "error", {
            autohide: 3000,
        });
    } finally {
        btn?.classList.remove("is-loading");
        if (btn) btn.textContent = old || "Send RSVP";
    }
}

// panggil saat DOM siap
document.addEventListener("DOMContentLoaded", loadWishesFromSheet);

// render satu kartu wish
function addWishCard({ name, wishes }) {
    const list = document.getElementById("wishes-list");
    if (!list) return;
    const card = document.createElement("article");
    card.className = "wish-card";
    card.innerHTML = `
    <div class="wish-name">${escapeHTML(name)}</div>
    <div class="wish-msg">${escapeHTML(wishes)}</div>
  `;
    list.prepend(card); // tampil paling atas
}

function loadWishesFromSheet() {
    const cb = "wishesCB_" + Math.random().toString(36).slice(2);
    const s = document.createElement("script");

    window[cb] = function (resp) {
        try {
            if (resp && resp.ok && Array.isArray(resp.data)) {
                // hanya ambil field yang dipakai
                wishesData = resp.data
                    .filter(
                        (item) =>
                            (item.name && item.name.trim()) ||
                            (item.wishes && item.wishes.trim())
                    )
                    .map((item) => ({
                        name: item.name || "Guest",
                        wishes: item.wishes || "",
                    }));
            } else {
                wishesData = [];
            }
            renderWishesPage(1); // tampilkan halaman pertama
        } finally {
            delete window[cb];
            s.remove();
        }
    };

    s.src = `${GAS_URL}?callback=${cb}&_=${Date.now()}`;
    document.body.appendChild(s);
}

function escapeHTML(str) {
    return (str || "").toString().replace(
        /[&<>"']/g,
        (s) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            }[s])
    );
}

// ==== State & konstanta ====
// Ubah ini aja kalau mau atur HP vs Desktop
const MOBILE_PAGE_SIZE = 3; // ⬅️ ganti angka ini untuk handphone
const DESKTOP_PAGE_SIZE = 6; // desktop tetap

function getPageSize() {
    return window.matchMedia("(max-width: 768px)").matches
        ? MOBILE_PAGE_SIZE // ⬅️ ini yang dipakai di HP
        : DESKTOP_PAGE_SIZE; // ini untuk desktop
}

let PAGE_SIZE = getPageSize();
let wishesData = [];
let currentPage = 1;

// Render satu kartu (return string HTML)
function renderWishItem(item) {
    return `
    <article class="wish-card">
      <div class="wish-name">${escapeHTML(item.name || "Guest")}</div>
      <div class="wish-msg">${escapeHTML(item.wishes || "")}</div>
    </article>
  `;
}

// Render halaman tertentu
function renderWishesPage(page = 1) {
    const listEl = document.getElementById("wishes-list");
    const pageEl = document.getElementById("wPage");
    const prevBtn = document.getElementById("wPrev");
    const nextBtn = document.getElementById("wNext");

    const total = Math.max(1, Math.ceil(wishesData.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, page), total);

    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const slice = wishesData.slice(start, end);

    listEl.innerHTML = slice.map(renderWishItem).join("");
    pageEl.textContent = `${currentPage}/${total}`;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= total;
}

// Tambahkan wish baru ke data & render ulang (top/halaman 1)
function addWishToData({ name, wishes }) {
    wishesData.unshift({ name, wishes });
    renderWishesPage(1);
}

// Hook tombol + init page size saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("wPrev")
        ?.addEventListener("click", () => renderWishesPage(currentPage - 1));
    document
        .getElementById("wNext")
        ?.addEventListener("click", () => renderWishesPage(currentPage + 1));

    // inisialisasi ukuran page sesuai device saat load
    PAGE_SIZE = getPageSize();
});

// --- helper: cek apakah fokus ada di field form
function isFormFocused() {
    const ae = document.activeElement;
    return ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName);
}

let resizeTimer;
window.addEventListener("resize", () => {
    // ⛔ skip saat user lagi mengetik / keyboard terbuka
    if (isFormFocused()) return;

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const newSize = getPageSize(); // fungsi yang kita pakai kemarin
        if (newSize !== PAGE_SIZE) {
            const firstIndex = (currentPage - 1) * PAGE_SIZE;
            PAGE_SIZE = newSize;
            const newPage = Math.floor(firstIndex / PAGE_SIZE) + 1;
            renderWishesPage(newPage);
        }
    }, 150);
});

// hook tombol
document.getElementById("btn-rsvp")?.addEventListener("click", processRSVP);

// === Toast Helper ===
const Toast = (() => {
    let root, timer;

    function ensureRoot() {
        if (!root) {
            root = document.createElement("div");
            root.id = "toast-root";
            document.body.appendChild(root);
        }
    }
    function hide() {
        if (!root) return;
        root.classList.remove("on");
        clearTimeout(timer);
        timer = null;
        setTimeout(() => {
            if (root) root.innerHTML = "";
        }, 200);
    }
    function show(message, type = "info", opts = {}) {
        ensureRoot();
        clearTimeout(timer);
        root.innerHTML = `
    <div class="toast ${type} ${opts.loading ? "loading" : ""}">
      <span class="t-icon"></span>
      <div class="t-msg">${message}</div>
    </div>
  `;
        // tidak ada listener close
        requestAnimationFrame(() => root.classList.add("on"));

        if (!opts.persist) {
            timer = setTimeout(hide, opts.autohide || 2500);
        }
        return {
            update(msg, nextType = type, nextOpts = {}) {
                const box = root.querySelector(".toast");
                if (!box) return;
                box.className = `toast ${nextType} ${
                    nextOpts.loading ? "loading" : ""
                }`;
                root.querySelector(".t-msg").textContent = msg;
                clearTimeout(timer);
                if (!nextOpts.persist) {
                    timer = setTimeout(hide, nextOpts.autohide || 2500);
                }
            },
            close: hide,
        };
    }

    return { show, hide };
})();

// util copy yg aman utk mobile + iOS
async function copyTextSafely(text) {
    // 1) Clipboard API (butuh HTTPS & support)
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            /* lanjut fallback */
        }
    }
    // 2) Fallback: textarea + execCommand (works on iOS)
    try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        // gaya supaya tak terlihat & tak trigger zoom
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        ta.style.fontSize = "16px";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
    } catch (e) {
        return false;
    }
}

// GANTI listener tombol copy kamu dengan ini:
document.querySelectorAll(".btn-copy").forEach((btn) => {
    btn.addEventListener(
        "click",
        async () => {
            const targetSel = btn.getAttribute("data-copy");
            const target = document.querySelector(targetSel);
            if (!target) return;
            const text = (
                target.getAttribute("data-copytext") ||
                target.textContent ||
                ""
            ).trim();

            const ok = await copyTextSafely(text);

            if (window.Toast) {
                Toast.show(
                    ok
                        ? "Account number copied"
                        : "Copy failed. Tap & hold to copy.",
                    ok ? "success" : "error",
                    { autohide: 1800 }
                );
            } else {
                const old = btn.textContent;
                btn.textContent = ok ? "Copied!" : "Copy failed";
                setTimeout(() => (btn.textContent = old), 1500);
            }
        },
        { passive: true }
    );
});

(function () {
    const root = document.documentElement;

    // Saat fokus di field dalam #rsvp → matikan smooth & snap, lalu center-kan field
    document.addEventListener("focusin", (e) => {
        if (!e.target.closest("#rsvp")) return;
        root.classList.add("keyboard-open", "no-snap");

        // tunggu keyboard naik dulu sedikit (Safari/iOS butuh jeda)
        setTimeout(() => {
            try {
                e.target.scrollIntoView({
                    block: "center",
                    inline: "nearest",
                    behavior: "auto",
                });
            } catch (_) {}
        }, 250);
    });

    // Saat keluar fokus → balikin state
    document.addEventListener("focusout", (e) => {
        if (!e.target.closest("#rsvp")) return;
        setTimeout(
            () => root.classList.remove("keyboard-open", "no-snap"),
            200
        );
    });

    // Bonus: jangan hitung ulang layout pagination saat user sedang mengetik
    function isTyping() {
        const a = document.activeElement;
        return a && /^(INPUT|TEXTAREA|SELECT)$/i.test(a.tagName);
    }
    let rzT;
    window.addEventListener("resize", () => {
        if (isTyping()) return; // ⛔ skip saat keyboard open
        clearTimeout(rzT);
        rzT = setTimeout(() => {
            // kalau kamu punya logika resize -> panggil di sini
            // contoh: PAGE_SIZE = getPageSize(); renderWishesPage(currentPage);
        }, 150);
    });
})();

// Disable Scrolling
(function () {
    const root = document.documentElement;
    const body = document.body;

    // --- helper untuk benar-benar memblokir scroll (wheel/touch/keyboard)
    function prevent(e) {
        e.preventDefault();
    }
    function blockKeys(e) {
        const keys = [
            " ",
            "Spacebar",
            "PageDown",
            "PageUp",
            "ArrowDown",
            "ArrowUp",
            "Home",
            "End",
        ];
        if (keys.includes(e.key)) e.preventDefault();
    }

    function lockScroll() {
        root.classList.add("lock-scroll");
        body.classList.add("lock-scroll");
        window.scrollTo(0, 0);

        document.addEventListener("wheel", prevent, { passive: false });
        document.addEventListener("touchmove", prevent, { passive: false });
        document.addEventListener("keydown", blockKeys, { passive: false });
    }

    function unlockScroll() {
        root.classList.remove("lock-scroll");
        body.classList.remove("lock-scroll");

        document.removeEventListener("wheel", prevent);
        document.removeEventListener("touchmove", prevent);
        document.removeEventListener("keydown", blockKeys);

        // (opsional) tandai sudah dibuka agar reload di tab yang sama tidak ngunci lagi
        sessionStorage.setItem("inv_opened", "1");
    }

    // --- Kunci hanya saat pertama kali kunjungan di tab ini
    if (sessionStorage.getItem("inv_opened") !== "1") {
        lockScroll();
    }

    // --- Buka ketika tombol Open Invitation diklik
    document.addEventListener(
        "click",
        function (e) {
            const btn = e.target.closest(".btn-enter"); // tombolmu
            if (!btn) return;

            // buka kunci
            unlockScroll();

            // kalau href adalah anchor (#section), scroll manual agar mulus
            const href = btn.getAttribute("href");
            if (href && href.startsWith("#")) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }
        },
        true
    );
})();

// Animasi Gallery
// ===== Smooth reveal untuk masonry tanpa ganggu layout =====
(function () {
    const container = document.querySelector(".masonry");
    if (!container) return;

    const items = Array.from(container.querySelectorAll(".masonry-item"));
    if (!items.length) return;

    // Stagger ringan (opsional, biar berasa “mengalir”)
    items.forEach((el, i) => {
        el.style.setProperty("--delay", `${(i % 6) * 40}ms`);
    });

    // Observer: saat item terlihat, tentukan arah kiri/kanan (khusus mobile),
    // lalu beri kelas .is-in → animasi jalan. Tidak mengubah ukuran/flow.
    const mqMobile = window.matchMedia("(max-width: 768px)");

    const io = new IntersectionObserver(
        (entries) => {
            const contRect = container.getBoundingClientRect();
            const midX = contRect.left + contRect.width / 2;

            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;

                // Tentukan arah hanya saat mobile, supaya natural 2 kolom
                if (mqMobile.matches) {
                    const r = el.getBoundingClientRect();
                    const centerX = r.left + r.width / 2;
                    el.classList.add(
                        centerX < midX ? "from-left" : "from-right"
                    );
                }

                el.classList.add("is-in");
                io.unobserve(el); // sekali animasi saja
            });
        },
        { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    );

    items.forEach((el) => io.observe(el));

    // Jika kamu sebelumnya pakai AOS untuk gallery, HAPUS data-aos dari .masonry-item
    // supaya tidak bentrok. AOS masih boleh dipakai untuk section lain.

    // Penting: bantu stabilkan layout agar tidak “geser”
    // → set width/height di <img> atau pakai aspect-ratio via CSS bila tau rasionya.
})();

// MUSIC
(function () {
    const audio = document.getElementById("bgm");
    const btn = document.getElementById("music-toggle");
    const icon = btn.querySelector("i");
    const TARGET_VOL = 0.5;

    // state: apakah user yg pause? dan apakah kita pause otomatis?
    let userPaused = true; // awalnya dianggap belum play (jadi "paused oleh user")
    let autoPaused = false;

    audio.volume = TARGET_VOL;

    function showMusicBtn() {
        btn.classList.add("is-visible");
    }

    function setPlayingUI(isPlaying) {
        btn.setAttribute("aria-pressed", String(isPlaying));
        btn.setAttribute(
            "aria-label",
            isPlaying ? "Pause music" : "Play music"
        );
        icon.className = isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
    }

    function fadeTo(volTarget = TARGET_VOL, ms = 900) {
        return new Promise((resolve) => {
            const start = audio.volume,
                diff = volTarget - start;
            if (Math.abs(diff) < 0.001) return resolve();
            const steps = Math.max(1, Math.round(ms / 50));
            let i = 0;
            (function tick() {
                i++;
                audio.volume = Math.max(
                    0,
                    Math.min(1, start + diff * (i / steps))
                );
                i >= steps ? resolve() : setTimeout(tick, 50);
            })();
        });
    }

    async function playWithFade(origin = "user") {
        try {
            audio.volume = 0;
            await audio.play(); // sudah ada user gesture sebelumnya
            await fadeTo(TARGET_VOL, 1200);
            setPlayingUI(true);
            userPaused = origin !== "user" ? false : false; // tetap false
            autoPaused = false;
        } catch (e) {
            console.debug("audio play failed:", e);
        }
    }

    async function pauseWithFade(origin = "user") {
        await fadeTo(0, 200);
        audio.pause();
        setPlayingUI(false);
        if (origin === "auto") {
            autoPaused = true; // hanya tandai auto-pause
            // jangan mengubah userPaused agar kita tahu ini bukan pause manual
        } else {
            userPaused = true; // pause manual oleh user
            autoPaused = false;
        }
    }

    // toggle tombol mengambang
    btn.addEventListener("click", async () => {
        if (audio.paused) {
            await playWithFade("user");
            userPaused = false;
        } else {
            await pauseWithFade("user");
            userPaused = true;
        }
    });

    // saat Open Invitation diklik → tampilkan tombol + mulai musik
    document.addEventListener(
        "click",
        async (e) => {
            const openBtn = e.target.closest(".btn-enter");
            if (!openBtn) return;
            showMusicBtn();
            if (audio.paused) {
                await playWithFade("user");
                userPaused = false;
            }
        },
        true
    );

    // ====== Auto pause/resume berdasar fokus/visibility ======
    function onHidden() {
        // kalau sedang bermain, pause otomatis
        if (!audio.paused) pauseWithFade("auto");
    }
    async function onVisible() {
        // resume hanya jika tadi kita yg auto-pause DAN user belum mem-pause manual
        if (autoPaused && !userPaused) {
            try {
                await playWithFade("auto");
            } catch (e) {
                /* kalau diblokir policy, biarkan tombol manual */
            }
        }
    }

    // Page Visibility API (lintas desktop & mobile)
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") onHidden();
        else onVisible();
    });

    // Fallback tambahan: iOS/Safari bisa kirim pagehide/pageshow
    window.addEventListener("pagehide", onHidden);
    window.addEventListener("focus", onVisible); // kembali ke tab/app

    // tombol tetap hidden saat awal; akan muncul setelah Open Invitation
    // (kalau mau muncul ulang setelah user pernah buka di tab yang sama, boleh showMusicBtn() di sini)
})();

// AOS Animation
AOS.init();
