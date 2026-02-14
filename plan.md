# EmailJS + Netlify + GitHub Actions Implementation Plan

**Project**: Static Website Integration (HTML/CSS/Vanilla JS)
**Goal**: Add email functionality, spam protection, and automated CI/CD for production deployment

---

## 1. Architecture Overview

**User Flow:**
1. User fills contact form on `/contact.html`
2. Form submits to EmailJS service (client-side only, no backend)
3. reCAPTCHA v2 validates user is human before submission
4. EmailJS sends email via authenticated credentials
5. User sees success/error feedback

**Deployment Flow:**
1. Developer pushes to `main` branch on GitHub
2. GitHub Actions workflow triggers automatically
3. Workflow retrieves Netlify auth token from GitHub Secrets
4. Workflow deploys static files to Netlify production
5. Site goes live at custom domain

**Key Principle**: No backend server needed. EmailJS handles email delivery securely via client-side API calls with authentication tokens.

---

## 2. Phase 1 – EmailJS + reCAPTCHA Integration

### Objectives
- Add EmailJS service to handle contact form submissions
- Integrate Google reCAPTCHA v2 (Checkbox) for spam protection
- Implement client-side form validation
- Provide clear success/error user feedback
- Maintain mobile-friendly responsive design

### Implementation Steps

**Step 1: Set Up EmailJS Account**
- Create free EmailJS account at https://www.emailjs.com
- Create new email service (Gmail recommended)
- Create email template for contact form
- Generate Service ID and Public Key
- Store these as secrets (see Phase 3)

**Step 2: Set Up Google reCAPTCHA v2**
- Go to https://www.google.com/recaptcha/admin
- Create new site with reCAPTCHA v2 (Checkbox)
- Get Site Key (public, embed in HTML) and Secret Key (private, for Netlify)
- Copy Site Key for HTML

**Step 3: Update contact.html**
- Add reCAPTCHA script in `<head>`
- Add reCAPTCHA div below message textarea
- Add EmailJS script in `<head>`
- Add hidden form fields for service ID and template ID
- Update form submit handler

**Step 4: Update main.js**
- Create form submission handler
- Validate all required fields (name, email, message)
- Check reCAPTCHA token before submission
- Call EmailJS `emailjs.send()` with form data
- Handle success response (clear form, show message)
- Handle error response (show error message)
- Prevent double-submission with button state management

**Step 5: Add Form Feedback UI**
- Create success message element (styled in CSS)
- Create error message element (styled in CSS)
- Hide success/error messages by default
- Show on submission response
- Auto-hide after 5 seconds

**Step 6: Test Everything**
- Test form validation on empty submission
- Test reCAPTCHA validation
- Test EmailJS integration (check inbox)
- Test error handling (network offline, invalid credentials)
- Test on mobile devices (responsive, touch-friendly)

### Required Environment Variables

| Variable | Purpose | Where Stored | Sensitivity |
|----------|---------|--------------|-------------|
| `EMAILJS_SERVICE_ID` | EmailJS service identifier | `contact.html` (hardcoded or script tag) | Low (public) |
| `EMAILJS_TEMPLATE_ID` | EmailJS template identifier | `contact.html` (hardcoded or script tag) | Low (public) |
| `EMAILJS_PUBLIC_KEY` | EmailJS public authentication | `main.js` initialization | Low (public key) |
| `RECAPTCHA_SITE_KEY` | Google reCAPTCHA site key | `contact.html` (in script src) | Low (public) |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA secret | Netlify environment variables | High (private) |

**Note on reCAPTCHA Secret Key:** 
- v2 Checkbox doesn't require server-side validation for basic protection
- If server validation needed: store in Netlify env vars (not used in this phase, but available for future serverless function)
- For now, v2 client-side is sufficient for spam prevention

### Security Considerations

1. **EmailJS Public Key is Safe**: Public keys are designed for client-side use. Not a security risk.
2. **reCAPTCHA Tokens**: v2 Checkbox tokens are validated on Google's servers.
3. **CORS**: EmailJS handles CORS. No backend needed.
4. **Rate Limiting**: Implement client-side: disable submit button for 2-3 seconds after submission.
5. **Input Sanitization**: Don't parse HTML from user inputs. EmailJS auto-escapes.
6. **Email Spoofing**: EmailJS verified sender domain prevents spoofing.
7. **Private Keys**: EMAILJS_PUBLIC_KEY is intentionally public. Private key never sent to client.

### Testing Checklist

- [ ] Contact form fields validate (required, email format)
- [ ] reCAPTCHA checkbox appears and can be interacted with
- [ ] Form doesn't submit until reCAPTCHA is checked
- [ ] Clicking submit calls EmailJS
- [ ] Email arrives in inbox with correct data
- [ ] Success message displays and hides after 5 seconds
- [ ] Error message displays on network error
- [ ] Submit button disabled for 3 seconds (prevent spam)
- [ ] Form clears after successful submission
- [ ] Mobile: form is responsive, all elements accessible
- [ ] Mobile: reCAPTCHA modal works on small screens

---

## 3. Phase 2 – Netlify Production Deployment

### Objectives
- Deploy static site to Netlify production
- No staging or preview deployments
- Validate all assets load correctly
- Set up custom domain (if applicable)
- Verify email still works after deployment

### Implementation Steps

**Step 1: Create Netlify Account & Site**
- Sign up at https://app.netlify.com (free tier)
- Create new site from Git
- Connect GitHub repository
- Skip initial auto-deploy (we'll use GitHub Actions instead)

**Step 2: Configure Netlify Build Settings**
- Set publish directory to `/` (root, static site)
- Set build command to: `echo "Static site, no build needed"` or leave blank
- Skip advanced build settings

**Step 3: Add Netlify Environment Variables**
- Set `RECAPTCHA_SECRET_KEY` in Netlify environment variables
  - (For future serverless validation if needed)

**Step 4: Generate Netlify Deploy Token**
- In Netlify settings → Applications → Personal access tokens
- Create token named "GitHub Actions Deploy"
- Copy token (use in GitHub Secrets)

**Step 5: Disable Auto-Deploy from Git**
- Go to Netlify site settings → Build & deploy
- Turn off auto-publish from Git
- Only GitHub Actions workflow will deploy

**Step 6: Test Manual Deployment**
- Test form functionality on live Netlify URL
- Check all CSS/JS loads (open DevTools Console)
- Verify images and assets load
- Test EmailJS submission on production
- Check email delivery

### Netlify Configuration Settings

```
Publish directory: / (root directory)
Build command: (leave empty or: echo "Static site")
Environment variables:
  RECAPTCHA_SECRET_KEY: [from Google reCAPTCHA admin]

Branch deploy settings:
  - Production branch: main
  - Deploy previews: DISABLED
  - Branch deploys: DISABLED
```

### Post-Deployment Verification Checklist

- [ ] Netlify deployment succeeds
- [ ] Site loads at Netlify URL (no 404s)
- [ ] CSS loads correctly (no styling issues)
- [ ] JS runs without console errors
- [ ] Images/assets load
- [ ] Contact form appears on /contact.html
- [ ] reCAPTCHA loads
- [ ] EmailJS script loads
- [ ] Form submission works and sends email
- [ ] Success/error messages display
- [ ] No sensitive keys exposed in client (inspect network tab)

---

## 4. Phase 3 – GitHub Actions CI/CD Setup

### Objectives
- Automate deployment on push to `main`
- Trigger Netlify build and deploy via API
- Secure credentials in GitHub Secrets
- Fail safely if deployment fails
- Minimal, maintainable workflow YAML

### Workflow Strategy

**Trigger**: Push to `main` branch only (no PRs, no other branches)

**Flow**:
1. GitHub Actions workflow starts
2. Checkout code from repository
3. Call Netlify API to deploy
4. Wait for deployment to complete
5. Report success/failure

**Why This Approach**: 
- No local build step needed (static site)
- Netlify handles deployment
- Minimal GitHub Actions usage (cost-effective)
- Single API call vs complex orchestration

### Required GitHub Secrets

1. **`NETLIFY_SITE_ID`**
   - Where to find: Netlify site settings → General → Site information
   - Value: Site ID (looks like: `abc123-site-id`)

2. **`NETLIFY_AUTH_TOKEN`**
   - Where to find: Netlify → User settings → Applications → Personal access tokens
   - Value: Deploy token (long string)
   - Keep private and rotate annually

### Example GitHub Actions YAML (Minimal and Clean)

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Netlify

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy Production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Netlify
        uses: nwtproject/netlify-cli-action@v2.2.1
        with:
          args: deploy --prod --dir .
          token: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          site_id: ${{ secrets.NETLIFY_SITE_ID }}
```

**Alternative (Using curl):**

```yaml
name: Deploy to Netlify

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy Production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Netlify via API
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.NETLIFY_AUTH_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"dir":".",force:true}' \
            https://api.netlify.com/api/v1/sites/${{ secrets.NETLIFY_SITE_ID }}/deploys
```

**Recommendation**: Use the Netlify CLI action (first example) — more reliable and feature-rich.

### Deployment Flow Explanation

```
Developer pushes to main
       ↓
GitHub Actions workflow triggers
       ↓
Checkout repository code
       ↓
Call Netlify API with auth token
       ↓
Netlify receives deployment request
       ↓
Netlify processes static files
       ↓
Netlify generates unique deploy URL
       ↓
Netlify publishes to production CDN
       ↓
GitHub Actions reports: SUCCESS ✅
       ↓
Changes live at custom domain
```

### Failure Handling & Monitoring

**Built-in Safety**:
- GitHub Actions automatically fails workflow if curl/API call returns error
- Netlify API returns error if auth fails or site doesn't exist
- No partial deployments (atomic)

**Monitoring**:
1. Check GitHub Actions tab → Workflow runs
2. Green checkmark = successful deployment
3. Red X = deployment failed (check logs)
4. Netlify automatically rolls back to previous deploy on failure

**What Could Fail**:
- `NETLIFY_AUTH_TOKEN` expired or invalid
- `NETLIFY_SITE_ID` incorrect
- Network timeout (rare, auto-retry in most clients)
- Corrupt or missing files in repository

**Recovery**:
1. Manual Netlify re-deploy: Click "Trigger deploy" in Netlify UI
2. Rollback: Use "Deploys" tab in Netlify, select previous deploy
3. Fix and push again to `main`

---

## 5. Rollback Strategy

**Scenario 1: Email Feature Breaks**
- Edit `contact.html` to remove EmailJS code or disable form
- Push to `main`
- GitHub Actions auto-deploys within 2 minutes
- Users see disabled form instead of broken form

**Scenario 2: Netlify Deployment Fails**
- Netlify keeps previous deploy live (no downtime)
- Fix issue in repository
- Push to `main` again
- GitHub Actions retries deployment

**Scenario 3: Need to Revert Entire Release**
- Go to Netlify → Deploys tab
- Click previous successful deploy
- Click "Restore" or "Set as published"
- Site reverts instantly (no GitHub push needed)
- Fix issue in repository
- Push to `main` to deploy fix

**Scenario 4: GitHub Actions Workflow Broken**
- Edit `.github/workflows/deploy.yml`
- Fix YAML syntax
- Push to `main`
- Workflow runs again with fixed code
- If still broken: temporarily revert to manual Netlify deploy via UI

---

## 6. Common Mistakes to Avoid

| Mistake | Impact | How to Prevent |
|---------|--------|---|
| Hardcoding reCAPTCHA Secret in client JS | High security risk (allows anyone to validate) | Store only Site Key in HTML; secret stays in Netlify env vars |
| Committing `.env` with EmailJS keys | Keys exposed in git history | Never commit env files; use Netlify/GitHub Secrets only |
| Setting wrong Netlify publish directory | 404 errors on all pages | Use `/` (root) for static site, not `/dist` or `/build` |
| Publishing to staging instead of production | Changes not visible to users | Disable branch previews; use GitHub Actions only for `main` |
| Forgetting to disable auto-deploy in Netlify | Two deployments per push (race condition) | Turn off "Deploy on Git push" in Netlify settings |
| Missing RECAPTCHA_SITE_KEY in HTML | reCAPTCHA won't load | Add before form: `<script src="https://www.google.com/recaptcha/api.js"></script>` |
| Not handling form submission errors | Users don't know if email failed | Add try-catch around EmailJS call; show error message |
| Expired NETLIFY_AUTH_TOKEN | Deployments fail silently | Set calendar reminder to rotate token yearly |
| Spam without rate limiting | Email inbox flooded | Add client-side: disable submit button 2-3 seconds after click |
| Not testing on mobile | reCAPTCHA modal unusable on small screens | Test contact form on iPhone/Android before deploying |

---

## 7. Implementation Order

**Week 1:**
- [ ] Phase 1: EmailJS + reCAPTCHA (Days 1-3)
- [ ] Phase 2: Netlify setup (Day 4)
- [ ] Phase 3: GitHub Actions (Day 5)

**Week 2:**
- [ ] Full end-to-end testing
- [ ] Production launch

---

## 8. Success Criteria

- ✅ Contact form sends emails via EmailJS
- ✅ reCAPTCHA prevents automated spam
- ✅ Form validates on all devices
- ✅ GitHub Actions deploys automatically on push to `main`
- ✅ Netlify serves static site with no 404s
- ✅ No sensitive keys in client-side code
- ✅ Deployments complete in < 2 minutes
- ✅ Rollback takes < 1 minute

---

**Status**: Ready for implementation
**Complexity**: Low
**Risk Level**: Low (static site, no backend)
**Estimated Effort**: 4-6 hours total
