# AutoCorrect AI — Official Website UI

A polished, AI-driven autocorrect demonstration designed to improve spelling, grammar, punctuation, and writing fluency. 

This repository provides both a standalone frontend interface that can be previewed locally and a complete Flask-based backend service. The UI includes a local browser fallback, allowing the core text correction features to work even when the backend API is offline.

---

## Features
* **AI-Driven Autocorrect:** Detects and resolves spelling, grammar, and punctuation mistakes instantly.
* **Dual Run Modes:** Preview instantly via static file hosting (Live Server) or run with a dedicated Python backend.
* **Local Fallback:** UI components remain functional for demonstration purposes without a running server.
* **REST API Endpoint:** Extensible backend route to process text correction programmatically.

---

## File Structure

```text
├── static/               # Assets including CSS stylesheets and JavaScript scripts
├── .gitignore            # Git ignore configurations
├── README.md             # Project documentation
├── app.py                # Flask application backend
├── index.html            # Main frontend user interface
└── requirements.txt      # Python dependencies
```

---

## Getting Started

### Option A: Open directly with VS Code Live Server (Frontend Only)
This version uses standard asset routing paths (`static/style.css`), allowing it to render fully styled directly within a browser or a static live server.

1. Clone or extract the repository files.
2. Open the project folder in **VS Code**.
3. Right-click `index.html` in the file explorer.
4. Select **Open with Live Server**.

### Option B: Run the full Flask backend (Recommended)
To run the project with its complete local server architecture, open your terminal inside the project directory and follow these steps:

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

2. **Activate the virtual environment:**
   * **Windows PowerShell:**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux:**
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies and start the application:**
   ```bash
   pip install -r requirements.txt
   python app.py
   ```

4. **Access the application:**
   Open your browser and navigate to `http://127.0.0.1:5000`.

---

## How to Test

1. Navigate to the application interface in your browser.
2. Paste or type the following sample text into the input field:
   ```text
   i recieved teh mesage yesterday and dont know wich file you want me to send. I can send it tomorow.
   ```
3. Click the **Improve Text** button to view the corrected output.

---

## API Documentation

### Correct Text
Processes an input string and returns the grammatically optimized version.

* **Endpoint:** `/api/correct`
* **Method:** `POST`
* **Content-Type:** `application/json`

**Request Body Example:**
```json
{
  "text": "i recieved teh mesage"
}
```

---

## Future Upgrades
Planned enhancements for transitioning this demonstration into a production-level AI writing assistant include:
* Migrating the lightweight correction engine to a dedicated transformer-based grammar model.
* Implementing user authentication and secure profile routing.
* Integrating MongoDB to store, log, and manage user writing histories.

<img src="Screenshot (76).png" alt="AutoCorrect AI Screenshot" width="600">
* Expanding localization to support multi-language text corrections.
* Deploying the application stack to a cloud platform (e.g., AWS, Heroku, or GCP).
