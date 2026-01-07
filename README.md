# FedRecover AI

**FedRecover AI** is a next-generation, serverless, AI-driven debt collection management platform designed for enterprise logistics.

## 🚀 Key Features Demonstrated
*   **Serverless Architecture**: Fully decoupled frontend and event-driven logic (simulated in this demo).
*   **AI-Powered Scoring**: Auto-calculates Recovery Probability & Priority Scores.
*   **Intelligent Allocation**: Auto-assigns cases to the best DCA based on capacity and scores.
*   **SOP Enforcement**: Tracks state changes and SLA compliance.
*   **Dual Portals**:
    *   **Admin Command Center**: For FedRecover internal teams (Dark Mode, High Density).
    *   **DCA Partner Portal**: For external agencies (Clean, Light Mode, Focused Task List).

## 🛠️ Tech Stack
*   **Frontend**: React, Vite, TypeScript
*   **Styling**: Tailwind CSS
*   **State/Logic**: Zustand (Simulating Serverless DB & Functions)
*   **Charts**: Recharts
*   **Icons**: Lucide React

## 🏁 How to Run Locally

Since this is a generated project, you will need Node.js installed on your machine.

1.  **Navigate to the project directory**:
    ```bash
    cd fed-recover-ai
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Start the Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open the Application**:
    *   Visit `http://localhost:5173` to view the **Admin Dashboard**.
    *   Visit `http://localhost:5173/portal` to view the **DCA Partner Portal**.

## 📝 Demo Walkthrough Script
1.  **Ingestion**: Go to "Case Management" and click "Ingest Selection" to simulate new API data.
2.  **AI Analysis**: Click "Analyze" on a NEW case. Watch the AI score and detailed rationale appear.
3.  **Allocation**: Click "Auto-Assign". The system picks the best DCA based on the score.
4.  **DCA Action**: Navigate to `/portal`. You will see the assigned case.
5.  **Resolution**: In the portal, click "Resolve".
6.  **Analytics**: Go back to the Admin Dashboard to see the "Total Recovered" metric update.

---
