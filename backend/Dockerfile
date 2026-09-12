FROM python:3.12-slim

WORKDIR /app
COPY requirements-django.txt ./
RUN pip install --no-cache-dir -r requirements-django.txt
COPY manage.py ./
COPY backend ./backend
COPY core ./core

ENV DJANGO_DEBUG=false
EXPOSE 8000
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
