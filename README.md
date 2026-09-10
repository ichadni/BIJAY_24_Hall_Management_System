
# 🏢 BIJAY_24 Hall Management System

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

A web-based **Hall Management System** developed collaboratively to digitalize and simplify the management of university residential hall activities.

The system provides separate interfaces for students and hall staff to manage hall-related services, student information, room and seat allocation, complaints, notices, and other administrative activities.

> **✅ Project Status:** Completed and tested locally. The project is not currently deployed.

---

## ✨ Key Features

The system provides dedicated functionality for students and hall office staff.

### 🎓 Student Portal

* Student registration and login
* Student dashboard
* Digital hall admission application
* View admission application status
* View room and seat allocation
* Find available hall seats
* Dining and meal management
* Laundry service requests
* Sports information
* Submit hall-related complaints
* View complaint information
* View important hall notices

### 🏢 Hall Office / Staff Portal

* Staff authentication
* Staff dashboard
* Manage student information
* Review hall admission applications
* Approve and manage applications
* Manage room and seat allocation
* Find and allocate available seats
* Review and manage student complaints
* Publish and manage hall information
* Monitor hall-related activities

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript
* Multi-Page Application (MPA)

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token (JWT)
* Bcrypt

### Tools

* Git & GitHub
* VS Code
* Postman
* MongoDB Atlas

---

## 📁 Project Structure

```text
BIJAY_24_Hall_Management_System/
│
├── backend/
│   ├── config/
│   │   └── ...
│   ├── middleware/
│   │   └── ...
│   ├── models/
│   │   └── ...
│   ├── routes/
│   │   └── ...
│   ├── .env.example
│   ├── api.js
│   ├── package.json
│   ├── seed.js
│   └── server.js
│
├── frontend/
│   ├── imgs/
│   │   ├── admin-dashboard.png
│   │   ├── admission-form.png
│   │   ├── admission-process.png
│   │   ├── application-admin.png
│   │   ├── complain.png
│   │   ├── find-hall-seat.png
│   │   ├── hall-feature.png
│   │   ├── homepage.png
│   │   ├── login.png
│   │   ├── registration.png
│   │   ├── review-application.png
│   │   ├── seat-allocate.png
│   │   ├── submit-complain.png
│   │   └── submit-form.png
│   │
│   ├── admission.html
│   ├── auth.js
│   ├── complaints.html
│   ├── dashboard.html
│   ├── dining.html
│   ├── hall-office.html
│   ├── index.html
│   ├── laundry.html
│   ├── login.html
│   ├── script.js
│   ├── seat_allocation.html
│   ├── sports.html
│   ├── staff-dashboard.html
│   ├── student-dashboard.html
│   └── style.css
│
└── README.md
````

---

## ⚙️ Local Setup & Installation

Follow these steps to run the project locally.

### Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/)
* MongoDB or a MongoDB Atlas account
* Git
* VS Code

---

### 1. Clone the Repository

```bash
git clone https://github.com/ichadni/BIJAY_24_Hall_Management_System.git
cd BIJAY_24_Hall_Management_System
```

---

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install the required dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory.

Add your environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

If the project includes seed data, initialize the database using:

```bash
node seed.js
```

Start the backend server:

```bash
node server.js
```

The backend will run locally at:

```text
http://localhost:5000
```

---

### 3. Frontend Setup

Navigate to the `frontend` directory.

You can open the project using the **Live Server** extension in VS Code.

For example:

```text
frontend/index.html
```

Make sure the frontend API URL points to the local backend:

```text
http://localhost:5000
```

The API configuration can be found in the relevant JavaScript files such as:

```text
frontend/script.js
frontend/auth.js
```

---

## 🔐 Authentication

The backend uses:

* **JWT** for authentication
* **Bcrypt** for secure password hashing
* **Role-based authorization** for different types of users

Authentication and authorization ensure that users can access functionality according to their assigned role.

---

## 🗄️ Database

The project uses **MongoDB** as the primary database.

MongoDB is used to store and manage information related to:

* Students
* Users
* Hall information
* Rooms
* Seats
* Admission applications
* Complaints
* Notices
* Dining-related information
* Laundry-related information
* Other hall management data

**Mongoose** is used to define database schemas and interact with MongoDB from the Node.js backend.

---

## 📸 Screenshots

The following screenshots demonstrate the major features and interfaces of the Hall Management System.

### 🏠 Homepage

![Homepage](frontend/imgs/homepage.png)

### 🔐 Login

![Login](frontend/imgs/login.png)

### 📝 Registration

![Registration](frontend/imgs/registration.png)

### 🎓 Admission Form

![Admission Form](frontend/imgs/admission-form.png)

### 📋 Admission Process

![Admission Process](frontend/imgs/admission-process.png)

### 🏢 Hall Features

![Hall Features](frontend/imgs/hall-feature.png)

### 🪑 Find Hall Seat

![Find Hall Seat](frontend/imgs/find-hall-seat.png)

### 📊 Admin Dashboard

![Admin Dashboard](frontend/imgs/admin-dashboard.png)

### 📄 Application Management

![Application Management](frontend/imgs/application-admin.png)

### 🔎 Review Application

![Review Application](frontend/imgs/review-application.png)

### 🪑 Seat Allocation

![Seat Allocation](frontend/imgs/seat-allocate.png)

### 📝 Submit Complaint

![Submit Complaint](frontend/imgs/submit-complain.png)

### 📋 Complaint Management

![Complaint Management](frontend/imgs/complain.png)

### 📄 Submit Form

![Submit Form](frontend/imgs/submit-form.png)

---

## 🚧 Project Status

The project is **completed** as an academic collaborative project.

### Current Status

| Component              | Status       |
| ---------------------- | ------------ |
| Frontend               | Completed    |
| Backend                | Completed    |
| Database               | Completed    |
| Authentication         | Completed    |
| API Development        | Completed    |
| Student Portal         | Completed    |
| Hall Office Portal     | Completed    |
| Admission Management   | Completed    |
| Room & Seat Allocation | Completed    |
| Complaint Management   | Completed    |
| Screenshots            | Added        |
| Deployment             | Not Deployed |

The system has been developed and tested in a local development environment.

---

## 👥 Team Contributions

This is a **collaborative academic project** developed by a team of two.

### 👨‍💻 Israt Jahan Chadni — Backend Developer

My primary responsibility was the **backend development and server-side functionality** of the system.

My contributions include:

* Developing the backend using **Node.js and Express.js**
* Designing and implementing RESTful APIs
* Designing MongoDB database schemas and models using **Mongoose**
* Implementing authentication and authorization
* Implementing **JWT-based authentication**
* Implementing secure password hashing using **Bcrypt**
* Developing student and user management functionality
* Developing hall admission APIs and functionality
* Implementing room and seat allocation functionality
* Developing complaint management APIs
* Handling hall-related data through backend services
* Integrating the backend with the frontend
* Testing and debugging APIs using **Postman**
* Managing backend project structure and functionality
* Managing database connectivity and server-side operations

### 👩‍💻 Teammate — Frontend Developer

My teammate was primarily responsible for the **frontend development and user interface**.

Their contributions include:

* Designing the user interface
* Developing frontend pages using **HTML, CSS, and JavaScript**
* Creating student and staff dashboards
* Developing admission-related interfaces
* Developing complaint-related interfaces
* Implementing frontend interactions
* Connecting frontend pages with backend APIs
* Improving the overall user experience and interface

---

## 🔮 Future Improvements

The following improvements can be considered for future versions:

* [ ] Deploy the frontend
* [ ] Deploy the backend
* [ ] Add real-time notifications
* [ ] Add email notifications
* [ ] Improve student and staff dashboards
* [ ] Add advanced hall statistics and reports
* [ ] Improve mobile responsiveness
* [ ] Add advanced search and filtering
* [ ] Add automated testing
* [ ] Improve API documentation
* [ ] Improve system security
* [ ] Add additional administrative features

---

## 🎯 Project Goals

The main goals of the Hall Management System are to:

* Reduce manual hall management processes
* Centralize student and hall information
* Simplify hall admission and application management
* Simplify room and seat allocation
* Improve complaint management
* Improve communication between students and hall staff
* Make hall-related services easier to access
* Reduce paperwork and manual record keeping
* Provide a structured digital platform for university hall management

---

## 👤 Author

### Israt Jahan Chadni

**Software Engineering Student**
Shahjalal University of Science & Technology (SUST)

* GitHub: [@ichadni](https://github.com/ichadni)
* LinkedIn: [Israt Chadni](https://www.linkedin.com/in/israt-chadni-016870287/)

---

## 📌 Note

This project was developed as part of an **academic collaborative project**.

The system has been completed and tested locally. The project is currently not deployed and is maintained as an academic and portfolio project.

