# NoSwipe Backend Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Configuration ✅
- [x] Install required packages (`gunicorn`, `dj-database-url`)
- [x] Verify packages are installed in virtual environment
- [x] Create `.env` file in backend directory
- [x] Add `.env` to `.gitignore`

### 2. Environment Variables Setup ✅
- [x] Set `DEBUG=False` in `.env`
- [x] Configure `SECRET_KEY`
- [x] Set up `ALLOWED_HOSTS`
- [x] Configure `DATABASE_URL`
- [x] Set up `CORS_ALLOWED_ORIGINS`
- [x] Configure `CSRF_TRUSTED_ORIGINS`

### 3. Django Settings Configuration ✅
- [x] Update `settings.py` to use environment variables
- [x] Configure database settings with `dj-database-url`
- [x] Set up static files configuration
- [x] Configure security settings
- [x] Add production-specific settings

## Local Production Testing

### 4. Static Files Setup ✅
- [x] Run `python manage.py collectstatic`
- [x] Verify static files are collected correctly
- [x] Test static file serving

### 5. Database Configuration ✅
- [x] Run `python manage.py migrate`
- [x] Verify all migrations are applied
- [x] Test database connections

### 6. Gunicorn Setup ✅
- [x] Create `Procfile`
- [x] Test Gunicorn locally
- [x] Verify server starts successfully
- [x] Test health check endpoint
- [x] Debug and fix any server issues

## CI/CD Setup

### 7. Testing Infrastructure ✅
- [x] Set up pytest configuration
- [x] Create test database configuration
- [x] Write basic health check tests
- [x] Add API endpoint tests
- [x] Configure test coverage reporting

### 8. GitHub Actions Setup ✅
- [x] Create `.github/workflows` directory
- [x] Configure test workflow:
  - Run tests on push/PR
  - Check code formatting
  - Run security checks
  - Generate test coverage report
- [x] Configure deployment workflow:
  - Automated staging deployments
  - Manual production deployments
  - Environment-specific checks

### 9. Branch Protection ⏳
- [ ] Set up branch protection rules
- [ ] Configure required status checks
- [ ] Set up PR review requirements
- [ ] Configure deployment environment protection

## Production Preparation

### 10. Production Files Setup ✅
- [x] Update `requirements.txt` with all dependencies
- [x] Add test requirements to `requirements-dev.txt`
- [x] Verify all production settings
- [x] Test production configuration locally
- [x] Document any environment-specific settings

### 11. Version Control ✅
- [x] Commit all changes (excluding `.env`)
- [x] Push to GitHub
- [x] Verify changes in staging branch
- [x] Merge staging -> main when ready for production

## DigitalOcean Deployment

### 12. DigitalOcean App Platform Setup ⏳
- [ ] Create new app in DigitalOcean
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Set Python version
  - Set build command: `pip install -r backend/requirements.txt`
  - Set run command: `cd backend && gunicorn backend.wsgi:application`
- [ ] Set up environment variables from `.env.example`
- [ ] Configure resources and scaling:
  - Start with Basic Plan
  - Enable auto-deploy for staging branch

### 13. Initial Deployment ⏳
- [ ] Deploy staging environment first
- [ ] Monitor build process
- [ ] Check deployment logs
- [ ] Verify application starts
- [ ] Configure custom domain for staging

### 14. Post-Deployment Verification ⏳
- [ ] Test health check endpoint
- [ ] Test authentication flow
- [ ] Verify static files serving
- [ ] Check security headers
- [ ] Monitor application performance
- [ ] Run full API test suite against staging

### 15. Production Deployment ⏳
- [ ] Review staging environment performance
- [ ] Merge staging -> main
- [ ] Tag release version (e.g., v1.0.0)
- [ ] Deploy to production environment
- [ ] Configure production domain
- [ ] Verify production deployment

## Monitoring and Maintenance

### 16. Monitoring Setup ⏳
- [ ] Set up error tracking (Sentry)
- [ ] Configure performance monitoring
- [ ] Set up alerts for:
  - Server errors
  - High latency
  - Failed health checks
- [ ] Document monitoring procedures

### 17. Documentation ⏳
- [ ] Update API documentation
- [ ] Document deployment procedures
- [ ] Create troubleshooting guide
- [ ] Document rollback procedures
- [ ] Add environment setup guide

## Legend
- ✅ Completed
- ⏳ Pending
- ❌ Blocked/Issues

## Notes
- Keep this checklist updated as deployment progresses
- Document any issues encountered and their solutions
- Update security measures as needed
- Regular testing of backup and restore procedures
- CI/CD pipeline should be validated before production deployment
