/* ═══════════════════════════════════════════════════════
   MURIOUS 20.0 — Registration Page Script
   Firebase + Razorpay Integration (Multi-Event)
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
const eventGrid = document.getElementById("eventGrid");
const eventCheckboxes = document.querySelectorAll('input[name="events"]');

const feeDisplay = document.getElementById("feeDisplay");
const feeAmount = document.getElementById("feeAmount");
const feeCount = document.getElementById("feeCount");

const regLoading = document.getElementById("regLoading");
const regSuccess = document.getElementById("regSuccess");
const regError = document.getElementById("regError");
const regErrorMsg = document.getElementById("regErrorMsg");
const registerBtn = document.getElementById("registerBtn");

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
eventCheckboxes.forEach((cb) => {

  cb.addEventListener("change", function () {

    if (this.checked) {
      eventCheckboxes.forEach((other) => {
        if (other !== this) other.checked = false;
      });
    }

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


// ── Calculate and display total fee ──
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


// ── Clear invalid on input ──
document.querySelectorAll(".form-group input").forEach((inp) => {

  inp.addEventListener("input", () => {

    inp.classList.remove("invalid");

    updateFeeDisplay();

  });

});


// ── Helper Functions ──
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
    /* PAYMENT SCREENSHOT VALIDATION */

   const screenshot = document.getElementById("paymentScreenshot").files[0];

   if(!screenshot){
    alert("Please upload the payment screenshot.");
    return;
   }

    hideMessages();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const college = document.getElementById("regCollege").value.trim();

    const participation = participationType ? participationType.value : "single";

    const teamMembers = getTeamMembers();

    const { totalFee, count, events: selectedEvents } = updateFeeDisplay();
    /* MAIN FORM VALIDATION */

let valid = true;

const nameField = document.getElementById("regName");
const emailField = document.getElementById("regEmail");
const phoneField = document.getElementById("regPhone");
const collegeField = document.getElementById("regCollege");

/* reset previous errors */
[nameField,emailField,phoneField,collegeField].forEach(f=>{
  f.classList.remove("invalid");
});

/* check empty */

if(!name){
  nameField.classList.add("invalid");
  valid=false;
}

if(!email){
  emailField.classList.add("invalid");
  valid=false;
}

if(!phone){
  phoneField.classList.add("invalid");
  valid=false;
}

if(!college){
  collegeField.classList.add("invalid");
  valid=false;
}

/* email format */

const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(email && !emailRegex.test(email)){
  emailField.classList.add("invalid");
  showErrorMsg("Please enter a valid email.");
  return;
}

/* phone format */

if(phone && !/^\d{10}$/.test(phone)){
  phoneField.classList.add("invalid");
  showErrorMsg("Phone number must be 10 digits.");
  return;
}

if(!valid){
  showErrorMsg("Please fill all required fields.");
  return;
}


    /* ── NEW TEAM MEMBER VALIDATION ── */

    for (let i = 1; i <= 4; i++) {

      const nameField = document.getElementById(`member${i}Name`);
      const rollField = document.getElementById(`member${i}Roll`);
      const phoneField = document.getElementById(`member${i}Phone`);

      const nameVal = nameField ? nameField.value.trim() : "";
      const rollVal = rollField ? rollField.value.trim() : "";
      const phoneVal = phoneField ? phoneField.value.trim() : "";

      if (nameVal || rollVal || phoneVal) {

        if (!nameVal || !rollVal || !phoneVal) {

          showErrorMsg(`Please complete all fields for Member ${i} or leave them empty.`);

          if (nameField) nameField.classList.add("invalid");
          if (rollField) rollField.classList.add("invalid");
          if (phoneField) phoneField.classList.add("invalid");

          return;
        }

        if (!/^\d{10}$/.test(phoneVal)) {

          phoneField.classList.add("invalid");

          showErrorMsg(`Member ${i} phone must be a 10 digit number.`);

          return;
        }

      }

    }


    if (count === 0) {
      showErrorMsg("Please select an event.");
      return;
    }


    showLoading(true);


    const eventNames = selectedEvents.map((e) => e.name).join(", ");
    
    try {
    
         if (db) {
    
        const batch = db.batch();
    
        for (const ev of selectedEvents) {
    
          const docRef = db.collection("registrations").doc();
    
          batch.set(docRef, {
    
            name: name,
            email: email,
            phone: phone,
            college: college,
            participationType: participation,
            teamMembers: teamMembers,
            event: ev.name,
            fee: ev.fee,
            totalPaid: totalFee,
            eventsInOrder: eventNames,
            paymentMethod: "QR Screenshot",
            paymentScreenshot: screenshot.name,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    
          });
    
        }
    
        await batch.commit();
    
      }
    
      showLoading(false);
    
      regForm.reset();
    
      eventCheckboxes.forEach((cb) => (cb.checked = false));
    
      feeDisplay.style.display = "none";
    
      showSuccessMsg();
    
    } catch (err) {
    
      console.error("Firestore save error:", err);
    
      showErrorMsg("Registration failed. Try again.");
    
    }
    
    
    
    
    
    

  });

}


// ── Init ──
document.addEventListener("DOMContentLoaded", () => {

  initFirebase();

  generateStars();

  generateParticles();

    /* QR BUTTON */
  document.getElementById("showQRBtn").addEventListener("click", function () {

    const selected = document.querySelectorAll('input[name="events"]:checked');

    if(selected.length === 0){
      alert("Please select an event first");
      return;
    }

    document.getElementById("qrPayment").style.display = "block";

  });

});