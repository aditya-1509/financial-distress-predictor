FROM continuumio/miniconda3:latest

WORKDIR /app

RUN conda install -c conda-forge python=3.12 catboost scikit-learn pandas numpy scipy -y && \
    conda clean -afy

COPY requirements.txt .
RUN pip install --no-cache-dir fastapi uvicorn pydantic python-dotenv python-multipart joblib pillow gunicorn

COPY . .

EXPOSE 7860

CMD ["sh", "-c", "cd backend && uvicorn main:app --host 0.0.0.0 --port 7860"]
