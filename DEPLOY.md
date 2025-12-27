# Deployment Guide - Hostinger

## Prerequisites
- Hostinger account with hosting plan
- Domain: divaananda.com configured

## Deployment Steps

### 1. Build the Project (Already Done)
```bash
cd astro-temp
npm run build
```
Output folder: `astro-temp/dist/`

### 2. Upload to Hostinger

#### Option A: File Manager
1. Login to Hostinger → hPanel
2. Go to **Files** → **File Manager**
3. Navigate to `public_html` folder
4. **Delete** existing files (if any)
5. Click **Upload** → Upload all files from `dist/` folder:
   - `index.html`
   - `_astro/` folder (CSS/JS)
   - `cv.pdf`
   - `profile.png`
   - `favicon.svg`
   - `robots.txt`
   - `sitemap.xml`

#### Option B: FTP Upload (Recommended)
1. Get FTP credentials from Hostinger hPanel → **Files** → **FTP Accounts**
2. Use FileZilla or similar FTP client
3. Connect and upload contents of `dist/` to `public_html/`

### 3. Verify Deployment
Visit https://divaananda.com and check:
- [ ] All sections load correctly
- [ ] Profile image displays
- [ ] CV download works
- [ ] Animations work
- [ ] Mobile responsive

### 4. SSL Certificate
Hostinger usually provides free SSL. Verify HTTPS works at:
https://divaananda.com

## Files in dist/ folder
```
dist/
├── index.html          # Main page
├── _astro/             # CSS and JS bundles
├── cv.pdf              # Downloadable resume
├── profile.png         # Profile photo
├── favicon.svg         # Site icon
├── robots.txt          # SEO
└── sitemap.xml         # SEO
```

## Troubleshooting
- **404 errors**: Make sure files are in `public_html`, not a subfolder
- **CSS not loading**: Check if `_astro/` folder uploaded correctly
- **Images broken**: Verify `profile.png` is in root of `public_html`
