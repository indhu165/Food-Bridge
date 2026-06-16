// ================= IMPORTS =================

import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  getDoc
}
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
}
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";


// ================= ELEMENTS =================

const authSection =
document.getElementById("authSection");

const donorSection =
document.getElementById("donorSection");

const receiverSection =
document.getElementById("receiverSection");

const signupBtn =
document.getElementById("signupBtn");

const loginBtn =
document.getElementById("loginBtn");

const authMessage =
document.getElementById("authMessage");

const donateBtn =
document.getElementById("donateBtn");

const quote =
document.getElementById("quote");

const fullPages =
document.querySelectorAll(".fullPage");
const viewDonationsBtn =
document.getElementById(
"viewDonationsBtn"
);

const myDonationsSection =
document.getElementById(
"myDonationsSection"
);

const backBtn =
document.getElementById(
"backBtn"
);


// ================= QUOTES =================

const quotes = [

  "🌍 One meal can change a life.",

  "❤️ Your kindness feeds hope.",

  "🙏 Thank you for sharing food and love.",

  "🍽️ No one sleeps hungry because of you.",

  "✨ Small act, big impact."

];


// ================= SIGNUP =================

signupBtn.onclick = async () => {

  const email =
  document.getElementById("email").value;

  const password =
  document.getElementById("password").value;

  const role =
  document.getElementById("role").value;

  try {

    const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(
      doc(
        db,
        "users",
        userCredential.user.uid
      ),
      {
        email: email,
        role: role
      }
    );

    authMessage.innerText =
    "✅ Account Created Successfully";

    authMessage.style.color =
    "#00ff95";

  }

  catch(error){

    authMessage.innerText =
    error.message;

    authMessage.style.color =
    "red";

  }

};


// ================= LOGIN =================

loginBtn.onclick = async () => {

  const email =
  document.getElementById("email").value;

  const password =
  document.getElementById("password").value;


  try {
await signInWithEmailAndPassword(
  auth,
  email,
  password
);

// Get user role from Firestore

const userDoc =
await getDoc(
  doc(
    db,
    "users",
    auth.currentUser.uid
  )
);

const role =
userDoc.data().role;

authSection.classList.add("hidden");

fullPages.forEach(page => {

  page.style.display = "none";

});

if(role === "donor"){

  donorSection.classList.remove("hidden");

  loadMyDonations();

  loadNotifications();

}
else{

  receiverSection.classList.remove("hidden");

  loadDonations();

}
    

  }

  catch(error){

    authMessage.innerText =
    error.message;

    authMessage.style.color =
    "red";

  }

};


// ================= LOGOUT =================

document.getElementById(
"logoutBtn1"
).onclick = logout;

document.getElementById(
"logoutBtn2"
).onclick = logout;


async function logout(){

  await signOut(auth);

  donorSection.classList.add("hidden");

  receiverSection.classList.add("hidden");

  authSection.classList.remove("hidden");

  fullPages.forEach(page => {

    page.style.display = "flex";

  });

}


// ================= DONATE =================

donateBtn.onclick = async () => {

  const donorName =
  document.getElementById(
  "donorName").value.trim();


  const foodName =
  document.getElementById(
  "foodName").value.trim();
  const category =
document.getElementById(
"category").value;

  const quantity =
  document.getElementById(
  "quantity").value;

  const location =
  document.getElementById(
  "location").value.trim();

  const phone =
  document.getElementById(
  "phone").value.trim();
  const imageFile =
document.getElementById(
"foodImage"
).files[0];
if(
imageFile &&
imageFile.size >
500000
){

  quote.innerText =
  "❌ Image must be less than 500 KB";

  quote.style.color =
  "red";

  return;

}

  // Validation

  if(
  !donorName ||
  !foodName ||
  !category ||
  !quantity ||
  !location ||
  !phone
){

    quote.innerText =
    "❌ Please fill all fields";

    quote.style.color =
    "red";

    return;
  }

  if(
    !/^[0-9]{10}$/.test(phone)
  ){

    quote.innerText =
    "❌ Enter valid 10 digit phone number";

    quote.style.color =
    "red";

    return;
  }

  if(quantity <= 0){

    quote.innerText =
    "❌ Quantity must be greater than zero";

    quote.style.color =
    "red";

    return;
  }

let imageBase64 = "";

if(imageFile){

  imageBase64 =
  await convertToBase64(
    imageFile
  );

}
  await addDoc(
collection(db,"donations"),
{

  donorName,

  category,

  foodName,

  quantity,

  location,

  phone,

  imageBase64,

  date:
  new Date()
  .toLocaleString(),

  createdAt:
  Date.now(),

  userEmail:
  auth.currentUser.email,

  status:"Available"

}
);


  const randomQuote =

  quotes[
    Math.floor(
      Math.random() *
      quotes.length
    )
  ];

  quote.innerText =

  `🙏 Thank you ${donorName}! ${randomQuote}`;

  quote.style.color =
  "#00ff95";


  // Clear Form

  document.getElementById(
  "donorName").value = "";

  document.getElementById(
"category").value = "";

  document.getElementById(
  "foodName").value = "";

  document.getElementById(
  "quantity").value = "";

  document.getElementById(
  "location").value = "";

  document.getElementById(
  "phone").value = "";
  document.getElementById(
"foodImage"
).value = "";

};



// ================= LOAD NGO TABLE =================

function loadDonations(){

  const foodList =
  document.getElementById(
  "foodList"
  );

  const q =
  query(
    collection(
      db,
      "donations"
    )
  );

  onSnapshot(
    q,
    (snapshot)=>{

      foodList.innerHTML = "";

      snapshot.forEach(
        (docSnap)=>{

          const data =
          docSnap.data();

          createDonationRow(
            docSnap.id,
            data
          );

        }
      );

      filterDonations();

    }
  );

}


// ================= CREATE ROW =================

function createDonationRow(
id,
data
){

  const foodList =
  document.getElementById(
  "foodList"
  );

  const row =
  document.createElement("tr");
  row.setAttribute(
  "data-id",
  id
);
row.innerHTML = `
<td>${data.donorName}</td>
<td>${data.category || "-"}</td>
<td>

${data.foodName}

${
data.imageBase64

?

`<br>
<img
src="${data.imageBase64}"
width="80"
height="80"
style="
margin-top:5px;
border-radius:10px;
object-fit:cover;
">`

:

""
}

</td>
<td>${data.quantity}</td>
<td>${data.date || "-"}</td>
<td>${data.location}</td>
<td>${data.phone}</td>
<td>${data.status}</td>

  <td>

  ${
    data.status === "Available"

    ?

    `

    <button
    onclick="acceptFood('${id}')">

    Accept

    </button>

    <button
    class="rejectBtn"
    onclick="rejectFood('${id}')">

    Reject

    </button>
    `
    :
    data.status === "Accepted"
    ?
    "✔ Accepted"
    :
    "❌ Rejected"
  }

  </td>

  `;

  foodList.appendChild(row);
}
// ================= DONOR DASHBOARD =================

function loadMyDonations(){

  const table =
  document.getElementById(
  "myDonations"
  );

  const q =
  query(
    collection(
      db,
      "donations"
    )
  );

  onSnapshot(
    q,
    (snapshot)=>{

      table.innerHTML = "";
      updateStats(snapshot);

      snapshot.forEach(
        (docSnap)=>{

          const data =
          docSnap.data();

          if(
            data.userEmail ===
            auth.currentUser.email
          ){

            const row =
            document.createElement(
            "tr");

            row.innerHTML = `

<td>
${data.category || "-"}
</td>

<td>
${data.foodName}
</td>

<td>
${data.quantity}
</td>
<td>
${data.date || "-"}
</td>
<td>
${data.status}
</td>
<td>
<button
class="editBtn"
onclick="editDonation('${docSnap.id}')">
Edit
</button>
<button
class="deleteBtn"
onclick="deleteDonation('${docSnap.id}')">
Delete
</button>
</td>
`;
            table.appendChild(
            row);
          }
        }
      );});}
// ================= ACCEPT =================
window.acceptFood =
async function(id){

  const donationRef =
  doc(
    db,
    "donations",
    id
  );

  await updateDoc(
    donationRef,
    {
      status:"Accepted",

      notification:
      "🎉 Your donation has been accepted!",

      notificationTime:
      new Date()
      .toLocaleString()
    }
  );

};
// ================= REJECT =================
window.rejectFood =
async function(id){
  const ref =
  doc(
    db,
    "donations",
    id
  );
  await updateDoc(
    ref,
    {
      status:"Rejected"
    }
  );
};
// ================= SEARCH =================
document.getElementById(
"searchInput"
)?.addEventListener(
"input",
filterDonations
);
// ================= FILTER =================
document.getElementById(
"statusFilter"
)?.addEventListener(
"change",
filterDonations
);
function filterDonations(){
  const search =
  document
  .getElementById(
  "searchInput"
  )
  ?.value
  .toLowerCase() || "";
  const status =
  document
  .getElementById(
  "statusFilter")
  ?.value || "All";
  const rows =
  document
  .querySelectorAll(
  "#foodList tr"
  );
  rows.forEach(row => {
    const text =
    row.innerText.toLowerCase();
    const rowStatus =
    row.children[7].innerText;
    const matchesSearch =
    text.includes(search);
    const matchesStatus =
    status === "All" ||
    rowStatus === status;
    row.style.display =
    matchesSearch &&
    matchesStatus
    ?
    ""
    :
    "none";
  });

}
window.editDonation =
async function(id){

  const newFood =
  prompt(
    "Enter new food name"
  );

  if(!newFood) return;

  const ref =
  doc(
    db,
    "donations",
    id
  );

  await updateDoc(
    ref,
    {
      foodName:newFood
    }
  );

};
window.deleteDonation =
async function(id){

  const confirmDelete =
  confirm(
    "Delete this donation?"
  );

  if(!confirmDelete) return;

  await deleteDoc(
    doc(
      db,
      "donations",
      id
    )
  );

};
viewDonationsBtn.onclick =
function(){

  donorSection.classList.add(
    "hidden"
  );

  myDonationsSection.classList.remove(
    "hidden"
  );

};
backBtn.onclick =
function(){

  myDonationsSection.classList.add(
    "hidden"
  );

  donorSection.classList.remove(
    "hidden"
  );

};

function updateStats(snapshot){

  let total = 0;

  let available = 0;

  let accepted = 0;

  let people = 0;

  snapshot.forEach(docSnap => {

    const data = docSnap.data();

    if(
      data.userEmail ===
      auth.currentUser.email
    ){

      total++;

      people +=
      Number(data.quantity);

      if(
        data.status ===
        "Available"
      ){

        available++;

      }

      if(
        data.status ===
        "Accepted"
      ){
        accepted++;
      }
    }
  });

  document.getElementById(
    "totalDonations"
  ).innerText = total;

  document.getElementById(
    "availableDonations"
  ).innerText = available;

  document.getElementById(
    "acceptedDonations"
  ).innerText = accepted;

  document.getElementById(
    "peopleServed"
  ).innerText = people;

}function convertToBase64(file){

  return new Promise(
    (resolve,reject)=>{

      const reader =
      new FileReader();

      reader.readAsDataURL(
        file
      );

      reader.onload =
      ()=> resolve(
        reader.result
      );

      reader.onerror =
      error => reject(
        error
      );

    }
  );

}function loadNotifications(){

  const box =
  document.getElementById(
    "notificationBox"
  );

  const q =
  query(
    collection(
      db,
      "donations"
    )
  );

  onSnapshot(
    q,
    (snapshot)=>{

      box.innerHTML = "";

      let found = false;

      snapshot.forEach(
        (docSnap)=>{

          const data =
          docSnap.data();

          if(
            data.userEmail ===
            auth.currentUser.email

            &&

            data.notification
          ){

            found = true;

            box.innerHTML += `
            <div class="notificationItem">

              ${data.notification}

              <br>

              <small>

                ${data.notificationTime}

              </small>

            </div>
            `;

          }

        }
      );

      if(!found){

        box.innerHTML =
        "No notifications yet";

      }

    }
  );

}