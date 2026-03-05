# Lightweight Event Management System

![Node.js](https://img.shields.io/badge/Node.js-green?style=flat&logo=node.js)
![Express.js](https://img.shields.io/badge/Framework-Express.js-lightgray)
![JavaScript](https://img.shields.io/badge/Frontend-Vanilla%20JS-yellow)

## About the Project
This web application was developed as a fundamental Web Programming course project. The primary goal was to grasp the core concepts of backend architecture, RESTful API design, and asynchronous operations in **Node.js**.

Instead of abstracting data behind a traditional relational database, this project deliberately utilizes a **file-based storage system** (`.json` files). This hands-on approach provided deep technical insight into the Node.js File System (`fs`) module, asynchronous data handling, and basic state management directly on the server.

## Key Features
* **Event Exploration:** Users can browse dynamically loaded event listings.
* **Cart/Ticketing System:** Implemented a basket logic to simulate ticket reservations (`sepetler.json`).
* **User Simulation:** Basic user data handling and routing (`users.json`).
* **Static File Serving:** Frontend assets (HTML, CSS, JS) are efficiently served from the `/public` directory.

## Technologies Used
* **Backend:** Node.js, Express.js
* **Data Storage:** JSON-based File I/O
* **Frontend:** Vanilla HTML5, CSS3, JavaScript

## How to Run Locally
1. Clone the repository: `git clone https://github.com/Yusuf952/etkinlik-proje-final.git`
2. Navigate to the project directory: `cd etkinlik-proje-final`
3. Install the required dependencies: `npm install`
4. Start the local server: `node server.js`
5. Open your browser and navigate to the port specified in your terminal (usually `http://localhost:3000`).

## Future Improvements (To-Do & Refactoring)
As an ongoing learning process, I acknowledge that this project represents an early stage of backend development. To meet production-level industry standards, I plan to implement the following architectural upgrades:
- [ ] **Database Migration:** Replace JSON file handling with a robust database system like **MongoDB** or **PostgreSQL**.
- [ ] **Authentication:** Implement stateless **JWT (JSON Web Tokens)** for secure user login and authorization.
- [ ] **Architecture:** Separate routing, controller, and model logic into a modular MVC structure.

---
*Developed by a Computer Engineering student looking to transition from academic concepts to professional software engineering practices.*
