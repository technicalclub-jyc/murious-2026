/* ═══════════════════════════════════════════════════════
   MURIOUS 20.0 — Registration Page Script
   Firebase Integration (Manual Payment Verification)
   ═══════════════════════════════════════════════════════ */

// ── Firebase Config ──
const firebaseConfig = {
  apiKey: "AIzaSyDFt5T1GCewg1Ai5PF6l3YG8y26dIEZ7Ug",
  authDomain: "techfest-registration-eace0.firebaseapp.com",
  projectId: "techfest-registration-eace0",
  storageBucket: "techfest-registration-eace0.firebasestorage.app",
  messagingSenderId: "1094190297812",
  appId: "1:1094190297812:web:007376a2e08b4ff7fb4141",
  measurementId: "G-36RTV9Y354",
};

let db = null;


// ── Initialize Firebase ──
function initFirebase() {
  try {
    if (typeof firebase !== "undefined") {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      console.log("✦ Firebase initialized");
    }
  } catch (e) {
    console.warn("Firebase init error:", e);
  }
}


// ── Generate Stars ──
function generateStars() {

  const container = document.getElementById("starfield");
  if (!container) return;

  const count = Math.floor((window.innerWidth * window.innerHeight) / 1500);

  for (let i = 0; i < count; i++) {

    const star = document.createElement("div");

    star.className = "star" + (Math.random() > 0.92 ? " large" : "");

    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";

    star.style.setProperty("--duration", 2 + Math.random() * 5 + "s");
    star.style.setProperty("--delay", Math.random() * 5 + "s");

    container.appendChild(star);
  }

}


// ── Generate Particles ──
function generateParticles() {

  const body = document.body;

  for (let i = 0; i < 15; i++) {

    const p = document.createElement("div");

    p.className = "particle";

    p.style.left = Math.random() * 100 + "%";
    p.style.bottom = "-10px";

    p.style.setProperty("--speed", 8 + Math.random() * 16 + "s");
    p.style.setProperty("--delay", Math.random() * 10 + "s");

    p.style.width = 2 + Math.random() * 4 + "px";
    p.style.height = p.style.width;

    body.appendChild(p);

  }

}


// ── DOM Elements ──
const regForm = document.getElementById("registerForm");
const eventCheckboxes = document.querySelectorAll('input[name="events"]');

const feeDisplay = document.getElementById("feeDisplay");
const feeAmount = document.getElementById("feeAmount");
const feeCount = document.getElementById("feeCount");

const regLoading = document.getElementById("regLoading");
const regSuccess = document.getElementById("regSuccess");
const regError = document.getElementById("regError");
const regErrorMsg = document.getElementById("regErrorMsg");

const participationType = document.getElementById("participationType");
const teamSection = document.getElementById("teamSection");


// ── Show / Hide Team Members ──
if (participationType) {

  participationType.addEventListener("change", function () {

    if (this.value === "team") {
      teamSection.style.display = "block";
    } else {
      teamSection.style.display = "none";
    }

    updateFeeDisplay();

  });

}


// ── Allow Only One Event ──
// ── Allow Multiple Events ──
eventCheckboxes.forEach((cb) => {
  cb.addEventListener("change", function () {
    updateFeeDisplay();

  });
});


// ── Get Team Members ──
function getTeamMembers() {

  const members = [];

  for (let i = 1; i <= 4; i++) {

    const name = document.getElementById(`member${i}Name`);
    const roll = document.getElementById(`member${i}Roll`);
    const phone = document.getElementById(`member${i}Phone`);

    if (name && name.value.trim()) {

      members.push({
        name: name.value.trim(),
        roll: roll ? roll.value.trim() : "",
        phone: phone ? phone.value.trim() : ""
      });

    }

  }

  return members;

}


// ── Get selected events ──
function getSelectedEvents() {

  const selected = [];

  eventCheckboxes.forEach((cb) => {

    if (cb.checked) {

      selected.push({
        name: cb.value,
        fee: parseInt(cb.getAttribute("data-fee")),
      });

    }

  });

  return selected;

}


// ── Calculate total fee ──
function updateFeeDisplay() {

  const selected = getSelectedEvents();

  let totalFee = 0;

  const teamMembers = getTeamMembers();

  const teamSize =
    participationType && participationType.value === "team"
      ? 1 + teamMembers.length
      : 1;

  selected.forEach((e) => {

    if (e.name === "HACKATHON") {
      totalFee += 80 * teamSize;
    } else {
      totalFee += e.fee;
    }

  });

  const count = selected.length;

  if (count > 0) {

    feeAmount.textContent = "₹" + totalFee;

    feeCount.textContent =
      count + (count === 1 ? " event selected" : " events selected");

    feeDisplay.style.display = "flex";

  } else {

    feeDisplay.style.display = "none";

  }

  return { totalFee, count, events: selected };

}


// ── Helper UI Functions ──
function showLoading(show) {

  if (regLoading) regLoading.classList.toggle("active", show);

}

function hideMessages() {

  if (regSuccess) regSuccess.classList.remove("active");
  if (regError) regError.classList.remove("active");

}

function showSuccessMsg() {

  hideMessages();
  if (regSuccess) regSuccess.classList.add("active");

}

function showErrorMsg(msg) {

  hideMessages();

  if (regErrorMsg) regErrorMsg.textContent = msg;
  if (regError) regError.classList.add("active");

}


// ── Form Submission ──
if (regForm) {

  regForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    hideMessages();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const college = document.getElementById("regCollege").value.trim();

    const transactionId = document.getElementById("transactionId").value.trim();
    const screenshot = document.getElementById("paymentScreenshot").files[0];

    const participation = participationType ? participationType.value : "single";

    const teamMembers = getTeamMembers();

    const { totalFee, count, events: selectedEvents } = updateFeeDisplay();

    let valid = true;

    const nameField = document.getElementById("regName");
    const emailField = document.getElementById("regEmail");
    const phoneField = document.getElementById("regPhone");
    const collegeField = document.getElementById("regCollege");
    const transactionField = document.getElementById("transactionId");
    const screenshotField = document.getElementById("paymentScreenshot");

    [nameField,emailField,phoneField,collegeField,transactionField].forEach(f=>{
      if(f) f.classList.remove("invalid");
    });

    if(!name){ nameField.classList.add("invalid"); valid=false; }
    if(!email){ emailField.classList.add("invalid"); valid=false; }
    if(!phone){ phoneField.classList.add("invalid"); valid=false; }
    if(!college){ collegeField.classList.add("invalid"); valid=false; }
    if(!transactionId){ transactionField.classList.add("invalid"); valid=false; }

    if(!screenshot){
      screenshotField.classList.add("invalid");
      valid=false;
    }

    /* EMAIL VALIDATION */

    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(email && !emailRegex.test(email)){
      emailField.classList.add("invalid");
      showErrorMsg("Please enter a valid email.");
      return;
    }

    /* PHONE VALIDATION */

    if(phone && !/^\d{10}$/.test(phone)){
      phoneField.classList.add("invalid");
      showErrorMsg("Phone number must be 10 digits.");
      return;
    }

    /* TEAM MEMBER VALIDATION */

    for (let i = 1; i <= 4; i++) {

      const nameField = document.getElementById(`member${i}Name`);
      const rollField = document.getElementById(`member${i}Roll`);
      const phoneField = document.getElementById(`member${i}Phone`);

      if(!nameField) continue;

      nameField.classList.remove("invalid");
      rollField.classList.remove("invalid");
      phoneField.classList.remove("invalid");

      const n = nameField.value.trim();
      const r = rollField.value.trim();
      const p = phoneField.value.trim();

      if(n || r || p){

        if(!n){ nameField.classList.add("invalid"); valid=false; }
        if(!r){ rollField.classList.add("invalid"); valid=false; }
        if(!p){ phoneField.classList.add("invalid"); valid=false; }

        if(p && !/^\d{10}$/.test(p)){
          phoneField.classList.add("invalid");
          showErrorMsg(`Member ${i} phone must be 10 digits`);
          return;
        }

      }

    }

    if(count===0){
      showErrorMsg("Please select an event.");
      return;
    }

    if(!valid){
      showErrorMsg("Please fill all required fields.");
      return;
    }

    showLoading(true);

    const eventNames = selectedEvents.map((e) => e.name).join(", ");

    const options = {
      key: RAZORPAY_KEY,
      amount: totalFee * 100,
      currency: "INR",
      name: "Murious 20.0",
      description: eventNames + " Registration",
      handler: async function (response) {
        try {
          if (db) {
            // Save a single registration document with all events
            await db.collection("registrations").add({
              name: name,
              email: email,
              phone: phone,
              college: college,
              participationType: participation,
              teamMembers: teamMembers,
              events: selectedEvents.map(ev => ({ name: ev.name, fee: ev.fee })),
              totalPaid: totalFee,
              eventsInOrder: eventNames,
              paymentId: response.razorpay_payment_id,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            });
          }
        } catch (err) {
          console.error("Firestore save error:", err);
        }
        showLoading(false);
        regForm.reset();
        eventCheckboxes.forEach((cb) => (cb.checked = false));
        feeDisplay.style.display = "none";
        showSuccessMsg();
      },
      modal: {
        ondismiss: function () {
          showLoading(false);
          showErrorMsg("Payment was cancelled. Registration not completed.");
        },
      },
      prefill: {
        name: name,
        email: email,
        contact: phone,
      },
      theme: {
        color: "#d4a853",
      },
    };
    const rzp = new Razorpay(options);
    rzp.open();

  });

}


// ── Init ──
document.addEventListener("DOMContentLoaded", () => {

  initFirebase();
  generateStars();
  generateParticles();

});