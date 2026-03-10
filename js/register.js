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

const RAZORPAY_KEY = "rzp_live_SODKZII24hVdSO";

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


// ── Filter Events by Participation Type ──
function filterEvents() {
  const type = participationType ? participationType.value : "single";
  const allCards = document.querySelectorAll(".event-card");

  allCards.forEach((card) => {
    const cardType = card.getAttribute("data-type");
    if (type === "team" && cardType === "solo") {
      card.style.display = "none";
      const cb = card.querySelector('input[type="checkbox"]');
      if (cb) cb.checked = false;
    } else if (type === "single" && cardType === "team") {
      card.style.display = "none";
      const cb = card.querySelector('input[type="checkbox"]');
      if (cb) cb.checked = false;
    } else {
      card.style.display = "";
    }
  });

  // Hide team section & reset when switching participation type
  if (teamSection) {
    teamSection.style.display = "none";
    teamSection.innerHTML = "";
  }

  updateFeeDisplay();
}


// ── Show / Hide Team Members on Participation Type Change ──
if (participationType) {
  participationType.addEventListener("change", function () {
    filterEvents();
  });
}


// ── Dynamically Build Team Member Fields ──
function buildTeamMemberFields(maxMembers) {
  if (!teamSection) return;
  teamSection.innerHTML = "";

  if (maxMembers <= 0) {
    teamSection.style.display = "none";
    return;
  }

  for (let i = 1; i <= maxMembers; i++) {
    const memberNum = i + 1; // Display as Member 2, 3, 4... since registrant is Member 1
    const nameGroup = document.createElement("div");
    nameGroup.className = "form-group";
    nameGroup.innerHTML = `<label>MEMBER ${memberNum} Full Name</label>
      <input type="text" id="member${i}Name" placeholder="Member ${memberNum} full name" />`;

    const emailGroup = document.createElement("div");
    emailGroup.className = "form-group";
    emailGroup.innerHTML = `<label>MEMBER ${memberNum} College Email Address</label>
      <input type="email" id="member${i}Email" placeholder="Member ${memberNum} college email" />`;

    const rollGroup = document.createElement("div");
    rollGroup.className = "form-group";
    rollGroup.innerHTML = `<label>MEMBER ${memberNum} Roll No</label>
      <input type="text" id="member${i}Roll" placeholder="Member ${memberNum} roll no" />`;

    const phoneGroup = document.createElement("div");
    phoneGroup.className = "form-group";
    phoneGroup.innerHTML = `<label>MEMBER ${memberNum} Phone Number</label>
      <input type="tel" id="member${i}Phone" placeholder="10-digit phone" pattern="[0-9]{10}" />`;

    teamSection.appendChild(nameGroup);
    teamSection.appendChild(emailGroup);
    teamSection.appendChild(rollGroup);
    teamSection.appendChild(phoneGroup);
  }

  teamSection.style.display = "block";

  // Attach clear-invalid listeners to new inputs
  teamSection.querySelectorAll("input").forEach((inp) => {
    inp.addEventListener("input", () => {
      inp.classList.remove("invalid");
      updateFeeDisplay();
    });
  });
}


// ── Handle Event Selection: show team fields only for team events ──
function handleEventSelection(selectedCb) {
  const card = selectedCb.closest(".event-card");
  const cardType = card ? card.getAttribute("data-type") : "solo";

  if (selectedCb.checked && cardType === "team") {
    const maxMembers = parseInt(card.getAttribute("data-max-members")) || 0;
    buildTeamMemberFields(maxMembers);
  } else {
    // Solo event or unchecked — hide team fields
    if (teamSection) {
      teamSection.style.display = "none";
      teamSection.innerHTML = "";
    }
  }
}


// ── Allow Only One Event + trigger team field logic ──
eventCheckboxes.forEach((cb) => {

  cb.addEventListener("change", function () {

    if (this.checked) {
      eventCheckboxes.forEach((other) => {
        if (other !== this) other.checked = false;
      });
    }

    handleEventSelection(this);
    updateFeeDisplay();
  });

});


// ── Get Team Members (dynamic count) ──
function getTeamMembers() {

  const members = [];
  let i = 1;

  while (true) {
    const name = document.getElementById(`member${i}Name`);
    const email = document.getElementById(`member${i}Email`);
    const roll = document.getElementById(`member${i}Roll`);
    const phone = document.getElementById(`member${i}Phone`);

    if (!name) break; // no more member fields

    if (name.value.trim()) {
      members.push({
        name: name.value.trim(),
        email: email ? email.value.trim() : "",
        roll: roll ? roll.value.trim() : "",
        phone: phone ? phone.value.trim() : ""
      });
    }

    i++;
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


// ── Get currently selected event card ──
function getSelectedEventCard() {
  for (const cb of eventCheckboxes) {
    if (cb.checked) return cb.closest(".event-card");
  }
  return null;
}


// ── Calculate and display total fee ──
function updateFeeDisplay() {

  const selected = getSelectedEvents();

  let totalFee = 0;

  const teamMembers = getTeamMembers();
  const card = getSelectedEventCard();
  const isTeamEvent = card && card.getAttribute("data-type") === "team";

  const teamSize = isTeamEvent ? 1 + teamMembers.length : 1;

  selected.forEach((e) => {

    if (e.name === "HACKATHON") {
      totalFee += e.fee * teamSize;
    } else if (e.name === "the triwizard contest") {
      // ₹50 per person: 3 people = ₹150, 4 people = ₹200
      totalFee += 50 * teamSize;
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


    /* ── DYNAMIC TEAM MEMBER VALIDATION ── */

    const selectedCard = getSelectedEventCard();
    const isTeamEvt = selectedCard && selectedCard.getAttribute("data-type") === "team";
    const minMembers = isTeamEvt ? parseInt(selectedCard.getAttribute("data-min-members")) || 0 : 0;
    const maxMembers = isTeamEvt ? parseInt(selectedCard.getAttribute("data-max-members")) || 0 : 0;

    let filledMemberCount = 0;

    for (let i = 1; i <= maxMembers; i++) {

      const memberNum = i + 1; // Display number (Member 2, 3, ...)
      const nameField = document.getElementById(`member${i}Name`);
      const emailField = document.getElementById(`member${i}Email`);
      const rollField = document.getElementById(`member${i}Roll`);
      const phoneField = document.getElementById(`member${i}Phone`);

      if (!nameField) break;

      const nameVal = nameField.value.trim();
      const emailVal = emailField ? emailField.value.trim() : "";
      const rollVal = rollField ? rollField.value.trim() : "";
      const phoneVal = phoneField ? phoneField.value.trim() : "";

      if (nameVal || emailVal || rollVal || phoneVal) {

        if (!nameVal || !emailVal || !rollVal || !phoneVal) {

          showErrorMsg(`Please complete all fields for Member ${memberNum} or leave them empty.`);

          if (nameField) nameField.classList.add("invalid");
          if (emailField) emailField.classList.add("invalid");
          if (rollField) rollField.classList.add("invalid");
          if (phoneField) phoneField.classList.add("invalid");

          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailVal)) {

          emailField.classList.add("invalid");

          showErrorMsg(`Member ${memberNum} email is not valid.`);

          return;
        }

        if (!/^\d{10}$/.test(phoneVal)) {

          phoneField.classList.add("invalid");

          showErrorMsg(`Member ${memberNum} phone must be a 10 digit number.`);

          return;
        }

        filledMemberCount++;
      }

    }

    if (isTeamEvt && filledMemberCount < minMembers) {
      showErrorMsg(`This event requires at least ${minMembers} team member(s) (plus you). Please fill in their details.`);
      return;
    }


    if (count === 0) {
      showErrorMsg("Please select an event.");
      return;
    }


    showLoading(true);


    const eventNames = selectedEvents.map((e) => e.name).join(", ");


    const options = {

      key: RAZORPAY_KEY,
      amount: totalFee * 100,
      currency: "INR",
      name: "Murious 20.0",
      description: selectedEvents[0].name + " Registration",

      handler: async function (response) {

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
                paymentId: response.razorpay_payment_id,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),

              });

            }

            await batch.commit();

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

  // Filter events based on initial participation type
  filterEvents();

});