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
