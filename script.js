// Simply Countdown
simplyCountdown(".simply-countdown", {
    year: 2026, // Target year (required)
    month: 9, // Target month [1-12] (required)
    day: 10, // Target day [1-31] (required)
    hours: 8, // Target hour [0-23], default: 0
    words: {
        // Custom labels, with lambda for plurals
        days: {
            root: "day",
            lambda: (root, n) => (n > 1 ? root + "s" : root),
        },
        hours: {
            root: "hour",
            lambda: (root, n) => (n > 1 ? root + "s" : root),
        },
        minutes: {
            root: "minute",
            lambda: (root, n) => (n > 1 ? root + "s" : root),
        },
        seconds: {
            root: "second",
            lambda: (root, n) => (n > 1 ? root + "s" : root),
        },
    },
    plural: true, // Use plurals for labels
});

// === SCROLL CONTROL ===
const rootElement = document.querySelector(":root");
const audio = document.getElementById("myAudio");
const audioIcon = document.querySelector(".audio-icon");
const audioIconI = document.querySelector(".audio-icon i");
const viewButton = document.querySelector(".view-invitation");

function disableScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;
    window.onscroll = function () {
        window.scrollTo(scrollLeft, scrollTop);
    };
    rootElement.style.scrollBehavior = "auto";
}

function enableScroll() {
    window.onscroll = function () {};
    rootElement.style.scrollBehavior = "smooth";
}

// === AUDIO UI SYNC ===
function updateAudioUI() {
    // tampilkan tombol icon
    audioIcon.style.display = "flex";

    if (!audio.paused && !audio.ended) {
        // sedang PLAY
        audioIconI.classList.add("bi-disc-fill");
        audioIconI.classList.remove("bi-pause-circle-fill");
    } else {
        // sedang PAUSE / STOP
        audioIconI.classList.remove("bi-disc-fill");
        audioIconI.classList.add("bi-pause-circle-fill");
    }
}

function playAudioSafe() {
    audio.muted = false;
    return audio
        .play()
        .then(() => {
            audio.volume = 0.5;
            updateAudioUI();
        })
        .catch((err) => {
            // kalau masih ke-block, user belum benar2 klik; icon tetap tampil utk klik manual
            console.warn("Autoplay blocked:", err);
            updateAudioUI();
        });
}

function toggleAudio() {
    if (audio.paused || audio.ended) {
        playAudioSafe();
    } else {
        audio.pause();
        updateAudioUI();
    }
}

// === INIT ===
const openedBefore = localStorage.getItem("opened") === "true";

if (!openedBefore) {
    // pertama kali: kunci scroll, sembunyikan icon audio sampai user klik
    disableScroll();
    audio.pause();
    audioIcon.style.display = "none";
} else {
    // pernah buka: scroll aktif, musik default PAUSE, icon tampil (ikon pause)
    enableScroll();
    audio.pause();
    updateAudioUI();
}

// sync UI saat state audio berubah (anti-miss)
["play", "pause", "ended"].forEach((ev) =>
    audio.addEventListener(ev, updateAudioUI)
);

// === HANDLERS ===
if (viewButton) {
    viewButton.addEventListener("click", () => {
        // kalau pertama kali, buka scroll & tandai sudah pernah buka
        if (!localStorage.getItem("opened")) {
            enableScroll();
            localStorage.setItem("opened", "true");
        }

        // tampilkan icon & toggle musik dari tombol ini juga
        updateAudioUI();
        toggleAudio();
    });
}

audioIcon.addEventListener("click", () => {
    toggleAudio();
});

// Personalize Invitation
const urlParams = new URLSearchParams(window.location.search);
const to = urlParams.get("to") || "";
const pronoun = urlParams.get("p") || "Mr./Mrs./Brother/Sister";

const nameInvatation = document.querySelector(".hero h4 span");
nameInvatation.innerText = `${pronoun} ${to},`.replace(/ ,$/, ",");

document.querySelector("#Name").value = to;

// AOS Animation
AOS.init();

// Music Focus
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        audio.pause();
    } else {
        if (isPlayAudio) {
            // hanya play kalau sebelumnya memang play
            audio.play();
        }
    }
});

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



