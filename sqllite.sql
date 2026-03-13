CREATE TABLE Operator (
operator_id INTEGER PRIMARY KEY,
operator_name TEXT,
contact_number TEXT
);

CREATE TABLE Balloon (
balloon_id INTEGER PRIMARY KEY,
capacity INTEGER,
balloon_type TEXT,
status TEXT,
operator_id INTEGER
);

CREATE TABLE Pilot (
pilot_id INTEGER PRIMARY KEY,
pilot_name TEXT,
license_number TEXT
);

CREATE TABLE Location (
location_id INTEGER PRIMARY KEY,
location_name TEXT,
city TEXT
);

CREATE TABLE Ride (
ride_id INTEGER PRIMARY KEY,
balloon_id INTEGER,
pilot_id INTEGER,
location_id INTEGER,
ride_date TEXT,
ride_time TEXT,
duration INTEGER
);

CREATE TABLE Passenger (
passenger_id INTEGER PRIMARY KEY,
passenger_name TEXT,
phone_number TEXT
);

CREATE TABLE Ticket (
ticket_id INTEGER PRIMARY KEY,
passenger_id INTEGER,
ride_id INTEGER,
booking_date TEXT,
seat_number TEXT,
price INTEGER
);

CREATE TABLE Payment (
payment_id INTEGER PRIMARY KEY,
ticket_id INTEGER,
payment_mode TEXT,
amount INTEGER,
payment_status TEXT
);

CREATE TABLE Weather (
weather_id INTEGER PRIMARY KEY,
ride_id INTEGER,
weather_type TEXT,
wind_speed INTEGER
);

CREATE TABLE Maintenance (
maintenance_id INTEGER PRIMARY KEY,
balloon_id INTEGER,
maintenance_type TEXT,
cost INTEGER
);
INSERT INTO Operator VALUES (1,'SkyRides','9876543210');

INSERT INTO Balloon VALUES (101,6,'Hot Air','Active',1);

INSERT INTO Pilot VALUES (201,'John Smith','LIC001');

INSERT INTO Location VALUES (301,'Sunset Valley','Jaipur');

INSERT INTO Ride VALUES (401,101,201,301,'2026-02-19','06:00 AM',45);

INSERT INTO Passenger VALUES (501,'Kalyan Raju','9876543211');

INSERT INTO Ticket VALUES (601,501,401,'2026-02-10','A1',5000);

INSERT INTO Payment VALUES (701,601,'UPI',5000,'Paid');

INSERT INTO Weather VALUES (801,401,'Clear',12);

INSERT INTO Maintenance VALUES (901,101,'Gas Refill',2000);