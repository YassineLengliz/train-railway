// ==========================
// FIREBASE CONFIG
// ==========================

const firebaseConfig = {
  apiKey: "AIzaSyDiucXk25l2eIVMtQfrFQQFH4NUlxuvZHw",
  authDomain: "train-railway.firebaseapp.com",
  databaseURL: "https://train-railway-default-rtdb.firebaseio.com",
  projectId: "train-railway",
  storageBucket: "train-railway.firebasestorage.app",
  messagingSenderId: "388440575642",
  appId: "1:388440575642:web:5ff756490a6ca7528b9923"
};

// ==========================
// TELEGRAM CONFIG
// ==========================

const TELEGRAM_BOT_TOKEN =
"8722219651:AAHirRmeh7whE6i8V8B1SRZVb9VRJ6w3wYA";

const TELEGRAM_CHAT_ID =
"5844272984";

// ==========================
// INITIALIZE FIREBASE
// ==========================

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

// ==========================
// HTML ELEMENTS
// ==========================

const statusText = document.getElementById("status");
const barrierText = document.getElementById("barrier");
const trainCountText = document.getElementById("trainCount");

const arrivalText = document.getElementById("arrivalCountdown");
const lastTrainText = document.getElementById("lastTrain");
const nextTrainText = document.getElementById("nextTrain");

const indicator = document.getElementById("liveIndicator");

const clockText = document.getElementById("clock");

// ==========================
// VARIABLES
// ==========================

let countdown = 10;

let lastTrainTime = null;

let notificationSent = false;

let countdownInterval = null;

let lastTrainInterval = null;

// ==========================
// REQUEST NOTIFICATION
// ==========================

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

// ==========================
// LIVE CLOCK
// ==========================

function updateClock() {

  const now = new Date();

  clockText.textContent =
    now.toLocaleTimeString();
}

setInterval(updateClock, 1000);

updateClock();

// ==========================
// UPDATE LAST TRAIN TIMER
// ==========================

function startLastTrainTimer()
{
  // prevent multiple intervals

  if(lastTrainInterval)
  {
    clearInterval(lastTrainInterval);
  }

  lastTrainInterval = setInterval(() => {

    if(!lastTrainTime) return;

    const now = new Date();

    const diff =
      Math.floor((now - lastTrainTime) / 1000);

    if(diff < 60)
    {
      lastTrainText.textContent =
        diff + " sec ago";
    }
    else
    {
      const minutes =
        Math.floor(diff / 60);

      lastTrainText.textContent =
        minutes + " min ago";
    }

  }, 1000);
}

// ==========================
// FIREBASE REALTIME LISTENER
// ==========================

// ==========================
// SEND TELEGRAM MESSAGE
// ==========================

function sendTelegramMessage(message)
{
  fetch(

`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,

    {
      method: "POST",

      headers: {
        "Content-Type":
        "application/json"
      },

      body: JSON.stringify({

        chat_id:
          TELEGRAM_CHAT_ID,

        text:
          message
      })
    }
  )
  .then(response => response.json())
  .then(data => {

    console.log(
      "Telegram message sent",
      data
    );

  })
  .catch(error => {

    console.error(
      "Telegram Error:",
      error
    );

  });
}


database.ref("railway").on("value", (snapshot) => {

  const data = snapshot.val();

  if (!data) return;

  // Update dashboard

  statusText.textContent =
    data.status || "Unknown";

  barrierText.textContent =
    data.barrier || "Unknown";

  trainCountText.textContent =
    data.trainCount || 0;

  // ==========================
  // TRAIN DETECTED
  // ==========================

  if(data.status === "TRAIN DETECTED" &&
     !notificationSent)
  {

    
    notificationSent = true;


    // TELEGRAM ALERT

sendTelegramMessage(

`🚆 TRAIN ALERT!

A train is arriving at the station.

🕒 ${new Date().toLocaleTimeString()}

🚧 Barrier Closed`

);

    // RED INDICATOR

    
    indicator.classList.remove("green");
    indicator.classList.add("red");

    // NOTIFICATION

    if(Notification.permission === "granted")
    {
      new Notification("🚆 Train Alert", {

        body:
          "A train is arriving at the station!",

        icon:
          "https://cdn-icons-png.flaticon.com/512/713/713311.png"
      });
    }

    // RESET COUNTDOWN

    countdown = 10;

    // CLEAR OLD INTERVAL

    if(countdownInterval)
    {
      clearInterval(countdownInterval);
    }

    // START COUNTDOWN

    countdownInterval = setInterval(() => {

      arrivalText.textContent =
        countdown + " sec";

      countdown--;

      // TRAIN ARRIVED

      if(countdown < 0)
      {
        clearInterval(countdownInterval);

        arrivalText.textContent =
          "Train Arrived";

        lastTrainTime = new Date();

        startLastTrainTimer();
      }

    }, 1000);

    // Example next train estimation

    nextTrainText.textContent =
      "Estimated in 5 min";
  }

  // ==========================
  // NO TRAIN
  // ==========================

  else if(data.status !== "TRAIN DETECTED")
  {
    notificationSent = false;

    indicator.classList.remove("red");
    indicator.classList.add("green");
  }

});