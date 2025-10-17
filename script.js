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

// AOS Animation
AOS.init();

// =======================
// FIREBASE CONFIGURATION
// =======================

// TODO: Ganti konfigurasi berikut dengan config dari Firebase Project kamu
const firebaseConfig = {
    apiKey: "AIzaSyBtf6t_6mFOe1TZIcuObdPVXMdvQc2A2FY",
    authDomain: "wedding-dekwid-1.firebaseapp.com",
    databaseURL:
        "https://wedding-dekwid-1-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wedding-dekwid-1",
    storageBucket: "wedding-dekwid-1.appspot.com",
    messagingSenderId: "108200316819",
    appId: "1:108200316819:web:a2e2829ee0268d7a652266",
};

// inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// =======================
// FORM KARTU UCAPAN
// =======================
const messageForm = document.getElementById("message-form");
const messageList = document.getElementById("messageList");

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("guestName").value.trim();
    const message = document.getElementById("guestMessage").value.trim();

    if (name === "" || message === "") {
        alert("Please fill out your name and message 🙏");
        return;
    }

    // Simpan ke Firebase Realtime Database
    const newMessageRef = database.ref("messages").push();
    newMessageRef.set({
        name: name,
        message: message,
        timestamp: Date.now(),
    });

    // Reset form
    messageForm.reset();

    // Tampilkan notifikasi sukses
    showSuccessToast();
});

// =======================
// MENAMPILKAN PESAN
// =======================
database.ref("messages").on("value", (snapshot) => {
    messageList.innerHTML = ""; // Hapus list lama
    const data = snapshot.val();

    if (data) {
        // Urutkan dari terbaru ke lama
        const sortedKeys = Object.keys(data).sort(
            (a, b) => data[b].timestamp - data[a].timestamp
        );

        sortedKeys.forEach((key) => {
            const msg = data[key];
            const div = document.createElement("div");
            div.classList.add("message-item");
            div.innerHTML = `
        <h5>${msg.name}</h5>
        <p>${msg.message}</p>
      `;
            div.style.animationDelay = "0s";
            messageList.appendChild(div);
        });
    } else {
        messageList.innerHTML =
            "<p class='text-center text-muted'>No messages yet — be the first to write one! 💌</p>";
    }
});

// =======================
// NOTIFIKASI SUKSES
// =======================
function showSuccessToast() {
    const toast = document.getElementById("successToast");
    toast.classList.add("show");

    // Hilangkan setelah 3 detik
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("rsvp-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const nameInput = form.querySelector('input[name="Name"]');
        const statusSelect = form.querySelector('select[name="Status"]');

        const nama = nameInput ? nameInput.value.trim() : "";
        const kehadiran = statusSelect ? statusSelect.value.trim() : "";

        if (!nama || !kehadiran || kehadiran.toLowerCase().includes("choose")) {
            Swal.fire({
                icon: "warning",
                title: "Data belum lengkap",
                text: "Harap isi nama dan pilih status kehadiran sebelum mengirim RSVP 🙏",
                confirmButtonColor: "#ff5e99",
            });
            return;
        }

        // ⏳ Langsung tampilkan loading popup
        Swal.fire({
            title: "Sending RSVP...",
            text: "Please Wait ❤️",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        const scriptURL = form.action;
        const formData = new FormData(form);

        fetch(scriptURL, { method: "POST", body: formData })
            .then((response) => {
                // ⏩ Tutup popup loading lalu tampilkan hasilnya
                if (response.ok) {
                    Swal.fire({
                        icon: "success",
                        title: "Your RSVP Already Sended",
                        text: "Thank you for your Confirmation ❤️",
                        confirmButtonColor: "#ff5e99",
                    });
                    form.reset();
                } else {
                    throw new Error("Failed RSVP");
                }
            })
            .catch(() => {
                Swal.fire({
                    icon: "error",
                    title: "Ups!",
                    text: "There was been a error. Please try again later or contact the couple 🙏",
                    confirmButtonColor: "#ff5e99",
                });
            });
    });
});

// Copy Text
function copyText(el) {
    var content = jQuery(el)
        .siblings("div.card-container")
        .find("div.card-number")
        .text()
        .trim();
    var temp = document.createElement("textarea");

    document.body.appendChild(temp);

    temp.value = content.replace(/\s+/g, "");
    temp.select();

    document.execCommand("Copy");

    document.body.removeChild(temp);

    jQuery(el).text("Berhasil di Copy");

    setTimeout(() => {
        jQuery(el).html(`<i class="fas fa-regular fa-copy"></i> Copy`);
    }, 1500);
}
