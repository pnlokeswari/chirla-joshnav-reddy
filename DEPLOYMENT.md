# Linguist Image Translator - Vercel Deployment Guide

This application is ready to be deployed on Vercel.

## Prerequisites
- A Vercel account ([vercel.com](https://vercel.com))
- Your Gemini API Key

## Deployment Steps

### Option 1: Using the Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the root directory.
3. Follow the prompts to link your project.
4. Add the environment variable:
   - `GEMINI_API_KEY`: Your Google AI Studio API Key.

### Option 2: Using GitHub (Recommended)
1. Export this project to a GitHub repository (use the **Settings > Export to GitHub** menu in AI Studio).
2. Go to [Vercel Dashboard](https://vercel.com/dashboard).
3. Click **New Project** and import your GitHub repository.
4. In the **Environment Variables** section, add:
   - `GEMINI_API_KEY`: Your Google AI Studio API Key.
5. Click **Deploy**.

## Configuration Details
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
