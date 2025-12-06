# Cloudflare Deployment Guide

## Prerequisites
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- GitHub repository connected to Cloudflare Pages

## Local Deployment Setup

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare
```bash
wrangler login
```

### 3. Build the project
```bash
npm run build
```

### 4. Deploy to Cloudflare Pages
```bash
wrangler pages deploy dist --project-name=luxe-hotel
```

## GitHub Actions Automated Deployment

### Setup Instructions

1. **Create Cloudflare API Token**
   - Go to Cloudflare Dashboard
   - Navigate to User Profile → API Tokens
   - Click "Create Token"
   - Use "Edit Cloudflare Workers" template
   - Grant permissions for "Cloudflare Pages" and "Workers"
   - Copy the token

2. **Get Cloudflare Account ID**
   - Go to Cloudflare Dashboard
   - Copy your Account ID from the sidebar

3. **Add Secrets to GitHub**
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add these secrets:
     - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
     - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID
     - `VITE_SUPABASE_URL`: Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
     - `VITE_API_URL`: Your API URL

4. **Push to Main**
   - The GitHub Actions workflow will automatically build and deploy when you push to the main branch

## Project Files for Cloudflare Deployment

- `wrangler.toml` - Cloudflare Workers configuration
- `_redirects` - SPA routing configuration (all routes redirect to index.html)
- `.env.production` - Production environment variables
- `.github/workflows/deploy.yml` - Automated deployment workflow

## Environment Variables

The following environment variables are required:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_API_URL` - API endpoint URL

## Build Configuration

The project is configured with:
- Output directory: `dist/`
- Target: ES2020
- Minification: Terser with console removal in production
- Source maps: Disabled for production

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm ci`
- Check that environment variables are set correctly
- Run `npm run type-check` to verify TypeScript errors

### Routing Issues
- The `_redirects` file handles SPA routing
- All routes are redirected to `index.html` for React Router to handle

### Environment Variable Issues
- Verify all `VITE_*` prefixed variables are set
- Check Cloudflare Pages project settings for environment variables
- Test locally with `.env` file first

## Performance Tips

1. Enable Cloudflare's Page Rules for caching
2. Use Cloudflare's Image Optimization for room images
3. Enable Brotli compression in Cloudflare settings
4. Set up HTTP/2 Server Push for critical assets
5. Use Cloudflare's Analytics Engine for monitoring

## Security

- All secrets are stored in GitHub Actions and never committed
- API keys are environment variables, not hardcoded
- Supabase RLS policies protect database access
- Cloudflare DDoS protection is automatically enabled
