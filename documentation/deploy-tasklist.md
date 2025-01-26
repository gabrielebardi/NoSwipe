# NoSwipe Deployment Guide (Frontend on Vercel, Backend on Render)

This guide provides a step-by-step plan to deploy NoSwipe with the frontend hosted on Vercel and the backend hosted on Render.

---

## Step 1: Prepare the Backend for Deployment (Render)

### 1.1 Update Backend Settings for Deployment

1. Open `backend/settings.py` and ensure:
   ```python
   import os
   from dotenv import load_dotenv
   import dj_database_url

   load_dotenv()

   DEBUG = os.getenv("DEBUG", "False") == "True"
   SECRET_KEY = os.getenv("SECRET_KEY")
   ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS").split(",")

   DATABASES = {
       'default': dj_database_url.config(default=os.getenv("DATABASE_URL"))
   }

   CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS").split(",")
   CSRF_TRUSTED_ORIGINS = os.getenv("CSRF_TRUSTED_ORIGINS").split(",")
   ```

Update .env for production:
    ```
    DEBUG=False
    SECRET_KEY=your_secret_key
    ALLOWED_HOSTS=your-backend.onrender.com
    DATABASE_URL=sqlite:///db.sqlite3
    CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
    CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app
    ```

1.2 Install Required Dependencies
Ensure requirements.txt includes:
    ```
    gunicorn==21.2.0
    dj-database-url==2.1.0
    whitenoise==6.6.0
    psycopg2-binary==2.9.9
    ```

1.3 Create Render Deployment Configuration
Create a Procfile in the backend directory:
    ```
    web: gunicorn backend.wsgi:application --log-file -
    ```

Create a render.yaml file:
    ```
    services:
      - type: web
        name: noswipe-backend
        env: python
        plan: free
        buildCommand: "pip install -r requirements.txt && python manage.py collectstatic --noinput"
        startCommand: "gunicorn backend.wsgi:application"
        envVars:
          - key: DEBUG
            value: "False"
          - key: SECRET_KEY
            sync: false
          - key: DATABASE_URL
            sync: false
          - key: ALLOWED_HOSTS
            value: "your-backend.onrender.com"
    ```

1.4 Push Code to GitHub
    ```
    git add .
    git commit -m "Prepare backend for Render deployment"
    git push origin main
    ```

1.5 Deploy on Render
Go to Render.com and create a new account.
Click New Web Service, select your GitHub repository.
Configure build and environment settings.
Click Deploy and monitor logs.

## Step 2: Prepare the Frontend for Deployment (Vercel)

2.1 Update Frontend Configuration
Update frontend/.env.local:
    ```
    NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
    ```

Ensure package.json includes:
    ```
    "scripts": {
      "build": "next build",
      "start": "next start"
    }
    ```

2.2 Push Frontend to GitHub
    ```
    git add .
    git commit -m "Prepare frontend for Vercel deployment"
    git push origin main
    ```

2.3 Deploy Frontend on Vercel
Go to Vercel.com and sign up.
Click New Project, select your GitHub repository.
Configure deployment settings and click Deploy.

## Step 3: Verify Deployment

Test Backend: Visit https://your-backend.onrender.com/api/.
Test Frontend: Visit https://your-frontend.vercel.app/.

## Step 4: Finalize Deployment

Custom Domain Setup: Add custom domains in Vercel and Render.
Enable HTTPS: Set up free SSL certificates.
Monitor Logs: Use platform logs to track performance.

## Step 5: Continue Development

Set Up Staging: Deploy a staging branch for testing.
CI/CD Automation: Use GitHub Actions for automated deployments.
Iterate Development: Push updates, test, and deploy.

## Summary

Component	Platform	Link
Frontend	Vercel	vercel.com
Backend	Render	render.com
Database	SQLite/PostgreSQL	Integrated with Render
Version Control	GitHub	github.com
This guide ensures NoSwipe is deployed smoothly while keeping development efficient and cost-effective.