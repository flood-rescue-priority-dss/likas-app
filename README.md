# LIKAS: Flood Rescue Priority Decision Support System

LIKAS is a comprehensive Decision Support System (DSS) designed to help the Manila City Disaster Risk Reduction and Management Office (MDRRMO) and local Barangays prioritize flood rescue and mitigation efforts. 

The system analyzes real-time and historical flood data, combining it with demographic vulnerability (Senior Citizens, PWDs, Pregnant Women, Children) to generate data-driven priority scores for every street in the city.

---

## Architecture Overview

The system is built using a modern **Microservices Architecture**, meaning it is split into three separate components that talk to each other. This separation ensures the system is fast, secure, and scalable.

### 1. `likas-frontend/` (The User Interface)
This folder contains the **React + Vite** code. It is entirely responsible for what the user sees on their screen (the dashboard, the maps, the tables, the colors).
* **`src/components/`**: Reusable UI blocks like buttons, modals, dropdowns, and map previews.
* **`src/pages/`**: The main screens of the app (Dashboard, Street Registry, Flood Records).
* **`src/services/`**: The "bridge" files that send HTTP requests to the Backend to fetch data.
* **`src/types/index.ts`**: The TypeScript definitions that ensure all data flowing through the app is strictly structured (e.g., ensuring a Priority is only ever 'High', 'Medium', or 'Low').
* **`src/index.css`**: The global stylesheet handling the beautiful, custom aesthetics.

### 2. `likas-backend/` (The Brain & Database)
This folder contains the **Node.js + Express** server. It acts as the gatekeeper of the system. It handles security, user logins, and serves the data to the frontend.
* **`src/index.js`**: The main entry point that starts the server on port 5000.
* **`src/middleware/auth.js`**: The security layer. It uses JWT (JSON Web Tokens) to verify who is logging in and blocks unauthorized access.
* **`src/routes/`**: The API endpoints. For example, `flood.js` handles requests for flood data, and `auth.js` handles login requests.
* **`src/data/baseline.js`**: **This is your database.** It contains all the exact numbers, rows, accounts, and street records from your Google Sheet dataset. The backend routes read from this file to serve data to the frontend.
* **`update-accounts.js`**: A utility script used to hash passwords and safely inject new accounts into `baseline.js`.

### 3. `likas-python/` (The Math & Scoring Engine)
This folder contains a **Python FastAPI** microservice. Python is the industry standard for data science and complex mathematics. It handles the heavy lifting of calculating vulnerability and priority scores.
* **`main.py`**: The server file that starts the Python API on port 8000.
* **`scoring/vulnerability_score.py`**: Contains the mathematical formula that calculates how vulnerable a street is based on its population of PWDs, Seniors, Children, and Pregnant women.
* **`scoring/priority_ranking.py`**: Contains the logic that combines the vulnerability score with the physical flood depth to categorize a street as High, Medium, or Low priority.

---

## How to Run the System

Since all three services need to run at the same time for the app to work, we created a single shortcut file to handle everything for you.

1. Locate the **`start-likas.bat`** file in the root folder.
2. Double-click it.
3. Three black command prompt windows will open. These are your Frontend, Backend, and Python servers running in the background. Do not close them.
4. Open your browser and navigate to: **`http://localhost:5173`**

*(To stop the system, simply click the 'X' on those three black windows).*

---

## System Access (Accounts)

The system features Strict Role-Based Access Control (RBAC). What you see depends entirely on how you log in.

### 1. Admin / MDRRMO (City-Wide View)
The Admin account has full access to view the data of every single barangay across the entire City of Manila.
* **Email:** `manila.mdrrmo@gov.ph`
* **Password:** `Mdrrmo2026!`

### 2. Barangay Official (Isolated View)
Barangay accounts are highly restricted. When a barangay logs in, the backend securely filters the database and *only* sends data belonging to their specific jurisdiction. They cannot see other barangays.
* **Example Brgy 651 Email:** `manila.brgy.651@gov.ph`
* **Example Brgy 651 Password:** `Brgy651!`
* *(Note: We generated accounts for every single barangay in your dataset. The format is `manila.<brgy-id>@gov.ph`, and the default password is `Password123!`)*
