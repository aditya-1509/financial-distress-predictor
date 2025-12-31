FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
# libgomp1 is required for CatBoost/XGBoost
RUN apt-get update && apt-get install -y \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Hugging Face Spaces port
EXPOSE 7860

# CMD to start the app
CMD ["sh", "-c", "cd backend && uvicorn main:app --host 0.0.0.0 --port 7860"]
