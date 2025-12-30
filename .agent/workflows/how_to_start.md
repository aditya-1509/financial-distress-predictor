---
description: How to start the Financial Distress Predictor project
---
# How to Start the Project

## Option 1: Quick Start (If already set up)

1. **Start the Backend**
   Open a terminal and run:
   ```bash
   ./start_backend.sh
   ```
   This will start the FastAPI server at `http://localhost:8000`.

2. **Start the Frontend**
   Open a **new** terminal window and run:
   ```bash
   ./start_frontend.sh
   ```
   This will start the React development server at `http://localhost:5173`.

## Option 2: Full Setup (First time or reset)

If the quick start doesn't work, or if you need to retrain the model:

1. **Run the Automated Setup**
   ```bash
   ./setup_and_train.sh
   ```
   This script will:
   - Create a Python virtual environment
   - Install dependencies
   - Process the dataset
   - Train the machine learning model

2. **Then follow the Quick Start steps above.**
