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

// Disable Scrolling for First Time
const rootElement = document.querySelector(":root");
const audio = document.getElementById("myAudio");
const audioIcon = document.querySelector(".audio-icon");
const audioIconPause = document.querySelector(".audio-icon i");
let isPlayAudio = false;

function disableScroll() {
    // Get the current scroll position
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

    // Add styles to body to disable scrolling
    window.onscroll = function () {
        window.scrollTo(scrollLeft, scrollTop);
    };

    rootElement.style.scrollBehavior = "auto";
}

function enableScroll() {
    // Remove the scroll disabling function
    window.onscroll = function () {};
    rootElement.style.scrollBehavior = "smooth";
    // localStorage.setItem("opened", "true");
    playAudio();
}

playAudio = () => {
    audioIcon.style.display = "flex";
    audio.play();
    audio.volume = 0.05; // 0.0 (mute) - 1.0 (max)
    isPlayAudio = true;
};

audioIcon.addEventListener("click", () => {
    if (isPlayAudio) {
        audio.pause();
        isPlayAudio = false;
        audioIconPause.classList.remove("bi-disc-fill");
        audioIconPause.classList.add("bi-pause-circle-fill");
    } else {
        audio.play();
        isPlayAudio = true;
        audioIconPause.classList.add("bi-disc-fill");
        audioIconPause.classList.remove("bi-pause-circle-fill");
    }
});

// if (!localStorage.getItem("opened")) {
//
// }
// disableScroll();

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

window.addEventListener("blur", () => {
    audio.pause();
});

window.addEventListener("focus", () => {
    if (isPlayAudio) {
        audio.play();
    }
});

// =======================
// FIREBASE CONFIGURATION
// =======================

// TODO: Ganti konfigurasi berikut dengan config dari Firebase Project kamu
const firebaseConfig = window.__FIREBASE_CONFIG__;
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
