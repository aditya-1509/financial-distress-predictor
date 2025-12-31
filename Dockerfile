FROM continuumio/miniconda3:latest

WORKDIR /app

# Install ALL dependencies via conda-forge for binary compatibility
# This avoids compilation issues with pip on minimal images
RUN conda install -c conda-forge -y \
    python=3.12 \
    catboost \
    scikit-learn \
    pandas \
    numpy \
    scipy \
    shap \
    matplotlib \
    fastapi \
    uvicorn \
    pydantic \
    python-dotenv \
    python-multipart \
    joblib \
    pillow \
    gunicorn \
    numba && \
    conda clean -afy

COPY requirements.txt .
# No pip install needed if conda covers everything

COPY . .

EXPOSE 7860

CMD ["sh", "-c", "cd backend && uvicorn main:app --host 0.0.0.0 --port 7860"]
