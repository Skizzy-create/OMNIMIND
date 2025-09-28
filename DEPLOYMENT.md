# 🚀 Vercel Deployment Guide for dAI-Vault

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Set up your environment variables in Vercel

## 🔧 Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Vite project

### 2. Configure Build Settings

Vercel should automatically detect these settings from `vercel.json`:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Privy Configuration
VITE_PRIVY_APP_ID=your-privy-app-id

# Optional: Add any other environment variables your app needs
NODE_ENV=production
```

### 4. Deploy

1. Click "Deploy" 
2. Wait for the build to complete
3. Your app will be available at your Vercel URL

## 🎯 What the vercel.json Does

### ✅ Fixes 404 Errors
- **SPA Routing**: All routes redirect to `index.html` for React Router
- **Asset Handling**: Properly serves static assets from `/dist` folder

### ⚡ Performance Optimizations
- **Asset Caching**: Static assets cached for 1 year
- **Security Headers**: XSS protection, content type sniffing prevention
- **Framework Detection**: Automatically uses Vite build system

### 🔒 Security Features
- **Content Security**: Prevents MIME type sniffing
- **Frame Protection**: Prevents clickjacking attacks
- **XSS Protection**: Enables browser XSS filtering

## 🐛 Troubleshooting

### 404 Errors Fixed
The `vercel.json` configuration specifically addresses:
- ✅ **SPA Routing**: All routes now serve `index.html`
- ✅ **Asset Loading**: Static files properly served
- ✅ **Build Output**: Correct directory structure

### Common Issues

1. **Build Fails**: Check that all TypeScript errors are resolved
2. **Environment Variables**: Ensure `VITE_PRIVY_APP_ID` is set
3. **Asset Loading**: Verify `dist` folder contains built files

## 📊 Build Output

Your successful build creates:
```
dist/
├── index.html          # Main HTML file
├── assets/
│   ├── index-*.css     # Styles
│   ├── index-*.js      # JavaScript bundles
│   └── *.wasm          # WebAssembly files (Walrus)
```

## 🎉 Success!

Once deployed, your dAI-Vault application will be accessible at:
`https://your-project-name.vercel.app`

The 404 error should be completely resolved with proper SPA routing! 🚀
