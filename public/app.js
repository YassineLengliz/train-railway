// Firebase Config

const firebaseConfig = {
  apiKey: "AIzaSyDiucXk25l2eIVMtQfrFQQFH4NUlxuvZHw",
  authDomain: "train-railway.firebaseapp.com",
  databaseURL: "https://train-railway-default-rtdb.firebaseio.com",
  projectId: "train-railway",
  storageBucket: "train-railway.firebasestorage.app",
  messagingSenderId: "388440575642",
  appId: "1:388440575642:web:5ff756490a6ca7528b9923"
};

// Initialize Firebase

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

// Elements

const statusText = document.getElementById("status");
const barrierText = document.getElementById("barrier");
const trainCountText = document.getElementById("trainCount");
const indicator = document.getElementById("liveIndicator");

const arrivalText = document.getElementById("arrivalCountdown");
const lastTrainText = document.getElementById("lastTrain");
const nextTrainText = document.getElementById("nextTrain");

let countdown = 10;
let lastTrainTime = null;

// CLOCK

function updateClock() {

  const now = new Date();

  document.getElementById("clock").textContent =
    now.toLocaleTimeString();
}

setInterval(updateClock, 1000);

updateClock();

// FIREBASE LISTENER

database.ref("railway").on("value", (snapshot) => {

  const data = snapshot.val();

  if (!data) return;

  statusText.textContent = data.status;

  barrierText.textContent = data.barrier;

  trainCountText.textContent = data.trainCount;

  // TRAIN DETECTED

  if(data.status === "TRAIN DETECTED")
  {

    // Push notification

if (Notification.permission === "granted") {

  new Notification("🚆 Train Alert", {
    body: "A train is arriving at the station!",
    icon: "https://cdn-icons-png.flaticon.com/512/713/713311.png"
  });

}


    indicator.classList.remove("green");
    indicator.classList.add("red");

    countdown = 10;

    const interval = setInterval(() => {

      arrivalText.textContent =
        countdown + " sec";

      countdown--;

      if(countdown < 0)
      {
        clearInterval(interval);

        arrivalText.textContent =
          "Train Arrived";

        lastTrainTime = new Date();

        updateLastTrain();
      }

    }, 1000);

  }
  else
  {
    indicator.classList.remove("red");
    indicator.classList.add("green");
  }
});

// LAST TRAIN TIMER

function updateLastTrain()
{
  if(!lastTrainTime) return;

  setInterval(() => {

    const now = new Date();

    const diff =
      Math.floor((now - lastTrainTime) / 1000);

    lastTrainText.textContent =
      diff + " sec ago";

  }, 1000);
}

nextTrainText.textContent =
  "Estimated in 5 min";