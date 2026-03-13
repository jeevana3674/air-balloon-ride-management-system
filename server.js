const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("frontend"));

app.use(session({
secret: "air_secret_key",
resave: false,
saveUninitialized: true
}));

const db = new sqlite3.Database("database.db");

/* ================= DATABASE ================= */

db.serialize(() => {

db.run(`CREATE TABLE IF NOT EXISTS Ride (
id INTEGER PRIMARY KEY AUTOINCREMENT,
description TEXT,
status TEXT,
location TEXT,
ride_date TEXT,
ride_time TEXT,
total_seats INTEGER DEFAULT 20,
booked_seats INTEGER DEFAULT 0
)`);

db.run(`CREATE TABLE IF NOT EXISTS Ticket (
id INTEGER PRIMARY KEY AUTOINCREMENT,
phone TEXT,
ride_id INTEGER,
persons INTEGER
)`);

db.run(`CREATE TABLE IF NOT EXISTS Admin (
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE,
password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS Pilot (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
available INTEGER DEFAULT 1
)`);

db.run(`CREATE TABLE IF NOT EXISTS Maintenance (
id INTEGER PRIMARY KEY AUTOINCREMENT,
description TEXT,
status TEXT
)`);

db.run(`INSERT OR IGNORE INTO Maintenance (id,description,status)
VALUES
(1,'Balloon Engine Check','Completed'),
(2,'Fuel System Inspection','Pending'),
(3,'Safety Equipment Check','Completed')`);

db.run(`INSERT OR IGNORE INTO Admin(username,password)
VALUES('admin','Admin@123')`);
db.run(`INSERT OR IGNORE INTO Admin(username,password)
VALUES('jeevana','jeevana@123')`);

});

/* ================= OTP LOGIN ================= */

let otpStore = {};

app.post("/send-otp",(req,res)=>{

const {phone} = req.body;

if(!phone || !/^[0-9]{10}$/.test(phone)){
return res.send("Phone must be exactly 10 digits");
}

const otp = Math.floor(1000 + Math.random()*9000);

otpStore[phone] = otp;

console.log("OTP for",phone,"is:",otp);

res.send("OTP sent successfully");

});

app.post("/verify-otp",(req,res)=>{

const {phone,otp} = req.body;

if(otpStore[phone] && otpStore[phone] == otp){

delete otpStore[phone];

req.session.user = phone;

res.send("Login Success");

}else{

res.send("Invalid OTP");

}

});

/* ================= ADMIN LOGIN ================= */

app.post("/admin-login",(req,res)=>{

const {username,password} = req.body;

if(!username || !password){
return res.send("Username and Password required");
}

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).+$/;

if(!passwordRegex.test(password)){
return res.send("Password must contain letter, number and special character");
}

db.get(
"SELECT * FROM Admin WHERE username=?",
[username],
(err,row)=>{

if(err){
return res.send("Server Error");
}

if(!row){
return res.send("Admin user not found");
}

if(row.password !== password){
return res.send("Invalid password");
}

req.session.admin=username;

res.send("Admin Login Success");

});

});

/* ================= VIEW RIDES ================= */
app.get("/rides", (req, res) => {

db.all(`
SELECT Ride.id,
Location.name AS location,
Ride.ride_date,
Ride.ride_time,
Ride.total_seats,
Ride.booked_seats
FROM Ride
LEFT JOIN Location
ON Ride.location_id = Location.id
`, [], (err, rows) => {

if (err) return res.json([]);

res.json(rows);

});

});
/* ================= BOOK TICKET ================= */
app.post("/book-ticket", (req, res) => {

const { rideId, persons } = req.body;

db.get("SELECT * FROM Ride WHERE id=?", [rideId], (err, ride) => {

if (!ride) return res.json({ message:"Ride not found" });

let newBooked = ride.booked_seats + parseInt(persons);

if (newBooked > ride.total_seats) {
return res.json({ message:"Not enough seats" });
}

db.run(
"UPDATE Ride SET booked_seats=? WHERE id=?",
[newBooked, rideId],
function(err){

if(err) return res.json({message:"Booking failed"});

res.json({message:"Ticket booked successfully"});

});

});

});
/* ================= VIEW TICKETS ================= */

app.get("/tickets",(req,res)=>{

db.all("SELECT * FROM Ticket",[],(err,rows)=>{

if(err){
return res.json([]);
}

res.json(rows);

});

});

/* ================= ADMIN DASHBOARD ================= */

app.get("/admin-dashboard",(req,res)=>{

db.get("SELECT SUM(booked_seats) AS total FROM Ride",[],(err,row)=>{

const totalSold = row && row.total ? row.total : 0;

db.all(`
SELECT Ride.id,
Location.name AS location,
Ride.ride_date,
Ride.ride_time,
Ride.total_seats,
Ride.booked_seats
FROM Ride
LEFT JOIN Location ON Ride.location_id = Location.id
`,[],(err2,rides)=>{

db.all("SELECT * FROM Pilot",[],(err3,pilots)=>{

db.all("SELECT * FROM Maintenance",[],(err4,maintenance)=>{

res.json({
totalSold: totalSold,
rides: rides || [],
pilots: pilots || [],
maintenance: maintenance || []
});

});

});

});

});

});

/* ================= UPDATE MAINTENANCE ================= */

app.post("/update-maintenance",(req,res)=>{

if(!req.session.admin){
return res.send("Unauthorized");
}

const {id,status} = req.body;

db.run(
"UPDATE Maintenance SET status=? WHERE id=?",
[status,id],
function(err){

if(err){
return res.send("Update Failed");
}

res.send("Maintenance Updated Successfully");

});

});

/* ================= SERVER ================= */

app.listen(PORT,()=>{

console.log("Server running at http://localhost:3000");

});
