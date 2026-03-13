// ================= LOGIN SELECTION =================

function showUser() {
  document.getElementById("userLogin").classList.remove("hidden");
  document.getElementById("adminLogin").classList.add("hidden");
}

function showAdmin() {
  document.getElementById("adminLogin").classList.remove("hidden");
  document.getElementById("userLogin").classList.add("hidden");
}

// ================= USER OTP =================

function sendOTP() {
  const phone = document.getElementById("phone").value;

  if (!/^[0-9]{10}$/.test(phone)) {
    alert("Phone must be exactly 10 digits");
    return;
  }

  fetch("/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone })
  })
  .then(res => res.text())
  .then(msg => alert(msg));
}

function verifyOTP() {
  const phone = document.getElementById("phone").value;
  const otp = document.getElementById("otp").value;

  fetch("/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp })
  })
  .then(res => res.text())
  .then(msg => {
    if (msg === "Login Success") {
      sessionStorage.setItem("phone", phone);
      window.location.href = "user.html";
    } else {
      alert(msg);
    }
  });
}

// ================= ADMIN LOGIN =================
// ================= ADMIN LOGIN =================

function adminLogin() {

const username = document.getElementById("adminUser").value.trim();
const password = document.getElementById("adminPass").value.trim();

if (!username || !password) {
alert("Please enter username and password");
return;
}

fetch("/admin-login", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({ username, password })
})
.then(response => response.text())
.then(message => {

if (message === "Admin Login Success") {
window.location.href = "admin.html";
} else {
alert(message);
}

})
.catch(error => {
console.error("Login error:", error);
alert("Server error. Please try again.");
});

}


// ================= USER DASHBOARD =================

function loadRides() {

const table = document.getElementById("rideTable");
if (!table) return;

fetch("/rides")
.then(res => res.json())
.then(data => {

table.innerHTML = "";   // clear old rows

data.forEach(ride => {

const available = ride.total_seats - ride.booked_seats;
let parts = ride.ride_date.split("-");
let formattedDate = parts[2] + "-" + parts[1] + "-" + parts[0];

table.innerHTML += `
<tr>
<td>${ride.id}</td>
<td>${ride.location || "-"}</td>
<td>${formattedDate}</td>
<td>${ride.ride_time}</td>
<td>${ride.total_seats}</td>
<td>${ride.booked_seats}</td>
<td>${available}</td>
</tr>
`;

});

});

}


// ================= BOOK TICKET =================

function bookTicket(){

const location = document.getElementById("rideLocation").value;
const dateInput = document.getElementById("rideDate").value;
const time = document.getElementById("rideTime").value;
const persons = document.getElementById("persons").value;
/* convert DD-MM-YYYY → YYYY-MM-DD */

let parts = dateInput.split("-");
let formattedDate = parts[2] + "-" + parts[1] + "-" + parts[0];

fetch("/book-ticket",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
location:location,
date:date,
time:time,
persons:persons
})
})
.then(res=>res.json())
.then(data=>{

if(data.message === "Ticket booked successfully"){

alert(
"Ticket Booked Successfully!\n\n"+
"Location: " + data.location + "\n"+
"Date: " + data.date + "\n"+
"Time: " + data.time + "\n"+
"Persons: " + data.persons
);

}else{
alert(data.message);
}

window.location.reload();

});

}
// ================= ADMIN DASHBOARD =================

function loadAdmin() {

const totalBox = document.getElementById("totalSold");
if (!totalBox) return;

fetch("/admin-dashboard")
.then(res => res.json())
.then(data => {

totalBox.innerText = data.totalSold || 0;


// ---------- RIDE TABLE ----------

const rideTable = document.getElementById("adminRideTable");

if (rideTable) {

rideTable.innerHTML = ""; // clear table first

data.rides.forEach(r => {

const available = r.total_seats - r.booked_seats;

rideTable.innerHTML += `
<tr>
<td>${r.id}</td>
<td>${r.location || "Unknown"}</td>
let parts = r.ride_date.split("-");
let formattedDate = parts[2] + "-" + parts[1] + "-" + parts[0];
<td>${formattedDate}</td>
<td>${r.ride_time}</td>
<td>${r.total_seats}</td>
<td>${r.booked_seats}</td>
<td>${available}</td>
</tr>
`;

});

}


// ---------- PILOT TABLE ----------

const pilotTable = document.getElementById("pilotTable");

if (pilotTable) {

pilotTable.innerHTML = ""; // clear duplicates

data.pilots.slice(0,10).forEach(p => {

let status = p.available == 1 ? "Yes" : "No";

pilotTable.innerHTML += `
<tr>
<td>${p.name}</td>
<td>${status}</td>
</tr>
`;

});

}

});

}




// ================= SAFE AUTO LOAD =================

document.addEventListener("DOMContentLoaded", function () {

loadRides();
loadAdmin();

});
