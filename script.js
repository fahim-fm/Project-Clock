// ==========================
// Digital Clock & Multi-Alarm App
// Author: Md Fahim Muntasir
// Features:
// - 12-hour clock with AM/PM
// - Multiple alarms persisted in localStorage
// - Modal popup with Stop/Snooze
// - Toast notifications
// - Stopwatch
// - Alarm sound unlock on first user interaction
// ==========================

window.addEventListener("DOMContentLoaded", () => {

  // --------------------------
  // DOM ELEMENTS
  // --------------------------
  const clockEl = document.getElementById("clock");
  const alarmInputEl = document.getElementById("alarmTime");
  const addAlarmBtn = document.getElementById("addAlarmBtn");
  const alarmListEl = document.getElementById("alarmList");
  const alarmSoundEl = document.getElementById("alarmSound");
  const modalEl = document.getElementById("alarmModal");
  const stopBtn = document.getElementById("stopAlarmBtn");
  const snoozeBtn = document.getElementById("snoozeAlarmBtn");

  const stopwatchEl = document.getElementById("stopwatch");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");

  // --------------------------
  // STATE
  // --------------------------
  let alarms = JSON.parse(localStorage.getItem("alarms")) || [];
  let currentAlarm = null;

  let stopwatchStartTime = 0;
  let stopwatchElapsed = 0;
  let stopwatchInterval = null;

  // --------------------------
  // AUDIO UNLOCK (for browsers)
  // --------------------------
  window.addEventListener("click", () => {
    if (alarmSoundEl.paused) {
      alarmSoundEl.play().then(() => {
        alarmSoundEl.pause();
        alarmSoundEl.currentTime = 0;
      }).catch(err => console.log("Audio unlock failed:", err));
    }
  }, { once: true });

  // --------------------------
  // HELPER FUNCTIONS
  // --------------------------
  const formatTo12Hour = (time24) => {
    let [hour, minute] = time24.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")} ${ampm}`;
  };

  const saveAlarms = () => localStorage.setItem("alarms", JSON.stringify(alarms));

  const showToast = (message, duration = 3000) => {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => (toast.style.opacity = 1), 10);
    setTimeout(() => {
      toast.style.opacity = 0;
      setTimeout(() => document.body.removeChild(toast), 500);
    }, duration);
  };

  // --------------------------
  // RENDER FUNCTIONS
  // --------------------------
  const renderAlarms = () => {
    alarmListEl.innerHTML = "";
    alarms.forEach((time, index) => {
      const li = document.createElement("li");
      li.textContent = formatTo12Hour(time);

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = () => {
        alarms.splice(index, 1);
        saveAlarms();
        renderAlarms();
        showToast(`❌ Alarm ${formatTo12Hour(time)} deleted`);
      };

      li.appendChild(delBtn);
      alarmListEl.appendChild(li);
    });
  };

  renderAlarms();

  // --------------------------
  // CLOCK FUNCTIONS
  // --------------------------
  const updateClock = () => {
    const now = new Date();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2,"0");
    const seconds = String(now.getSeconds()).padStart(2,"0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    hours = String(hours).padStart(2,"0");

    clockEl.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;

    // Check alarms in 24-hour format
    const now24 = `${String(now.getHours()).padStart(2,"0")}:${minutes}`;
    if (alarms.includes(now24) && !currentAlarm) {
      currentAlarm = now24;
      showAlarmModal();
    }
  };

  const showAlarmModal = () => {
    modalEl.style.display = "flex";
    alarmSoundEl.loop = true;
    alarmSoundEl.play();
  };

  setInterval(updateClock, 1000);
  updateClock();

  // --------------------------
  // ALARM FUNCTIONS
  // --------------------------
  addAlarmBtn.addEventListener("click", () => {
    if (alarmInputEl.value && !alarms.includes(alarmInputEl.value)) {
      alarms.push(alarmInputEl.value);
      saveAlarms();
      renderAlarms();
      showToast(`✅ Alarm set for ${formatTo12Hour(alarmInputEl.value)}`);
    } else {
      showToast("⚠️ Invalid or duplicate time!");
    }
  });

  const stopCurrentAlarm = () => {
    alarmSoundEl.pause();
    alarmSoundEl.currentTime = 0;
    modalEl.style.display = "none";

    if (currentAlarm) {
      alarms = alarms.filter(a => a !== currentAlarm);
      saveAlarms();
      renderAlarms();
      currentAlarm = null;
    }
  };

  stopBtn.addEventListener("click", stopCurrentAlarm);

  snoozeBtn.addEventListener("click", () => {
    if (!currentAlarm) return;

    const [hour, minute] = currentAlarm.split(":").map(Number);
    const date = new Date();
    date.setHours(hour, minute + 5);

    const snoozeTime = `${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
    alarms.push(snoozeTime);
    saveAlarms();
    renderAlarms();

    showToast("💤 Alarm snoozed for 5 minutes");
    stopCurrentAlarm();
  });

  // --------------------------
  // STOPWATCH FUNCTIONS
  // --------------------------
  const updateStopwatch = () => {
    const now = Date.now();
    const diff = stopwatchElapsed + (now - stopwatchStartTime);

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    stopwatchEl.textContent =
      `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
  };

  startBtn.addEventListener("click", () => {
    if (!stopwatchInterval) {
      stopwatchStartTime = Date.now();
      stopwatchInterval = setInterval(updateStopwatch, 100);
    }
  });

  pauseBtn.addEventListener("click", () => {
    if (stopwatchInterval) {
      clearInterval(stopwatchInterval);
      stopwatchInterval = null;
      stopwatchElapsed += Date.now() - stopwatchStartTime;
    }
  });

  resetBtn.addEventListener("click", () => {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    stopwatchElapsed = 0;
    stopwatchEl.textContent = "00:00:00";
  });

});
