# Scribe & Parchment — Book, Poem & Quote Studio

> A serene, distraction-free literary workshop crafted in the **Morning Paper** aesthetic. Compose books, poetry, and quotations with classical typography, realistic book simulation readers, multi-laptop transfer archives, auto-save timers with past revisions history, and instant high-resolution image and standalone HTML exports. Ready to deploy directly to Vercel.

---

## 🎨 Color Palette & Typography
- **Morning Paper**: `#F5FBE6` (Soft morning cream newsprint base)
- **Silent Grove**: `#215E61` (Deep calming forest teal)
- **Blue Monolith**: `#233D4D` (Midnight ink slate)
- **Typefaces**: Classical literary serif fonts including *EB Garamond*, *Cinzel*, *Cormorant Garamond*, and *Newsreader*.

---

## ✨ Features

### 1. 💾 Auto-Save & Revision History (Never Lose Past Works)
- **Configurable Timer**: Choose to auto-save every **1 min**, **2 mins** (default), **5 mins**, or **10 mins**.
- **Real-time Keystroke Caching**: Keystrokes are cached to `localStorage` continuously so accidental tab closures won't lose your work.
- **Past Revisions Browser**: Review timestamped historical snapshots of your writing and restore any earlier revision with 1 click.
- **Visual Status Pill**: Live status indicator in the top header displaying the exact time of the last save (`Saved at 7:28 PM`).

### 2. 💻 Multi-Laptop Archive Transfer (Export & Import)
- **Export Complete Archive**: One click creates a portable `.json` archive containing all your books, poems, quotes, and revision history.
- **Transfer to Another Laptop**: Save the file to a USB drive, cloud storage, or email, open Scribe & Parchment on another laptop/browser, and click **Import Archive**.
- **Smart Import Modes**:
  - **Merge**: Adds imported works to your shelf without overwriting existing works.
  - **Replace**: Restores the complete archive state.
- **Export Single Work**: Selectively export just one specific book, poem, or quote.

### 3. 📖 Book Workshop
- Structured book builder: **Title**, **Subtitle**, **Author**, **Genre**, **Year**, **Dedication / Epigraph**, and **About / Context**.
- **Multi-Chapter Management**: Add, reorder, and edit chapters with dropcap opening typography and automatic word/reading-time statistics.
- **Book Simulation Reader**: 3D two-page physical volume simulation with page crease, table of contents, and subtle paper-turn sound effects.
- **Standalone HTML Export**: Download a single self-contained `.html` book file that opens in any browser offline or online with full two-page navigation and print support.

### 4. 🪶 Poetry Broadsheet Studio
- Compose verses with natural stanza formatting.
- Include **Poetic Form** (Free Verse, Sonnet, Haiku, etc.), **Date / Inscription**, and **Context / Inspiration**.
- **Broadsheet Snapshot**: Export your poem as a framed high-resolution image card.
- **Standalone HTML Broadsheet**: Offline single-file presentation ready to share or print.

### 5. 💬 Quotation Snapshot Studio
- Create quotes with **Quotation Body (Above)**, **Maker / Author Name (Below)**, **Context / Source Work**, and **Year**.
- **Instant Live Preview Card**: See exactly how your quote card looks in real time.
- **High-Resolution Image (.PNG) Export**:
  - Customizable Aspect Ratios: `1:1` (Square), `4:5` (Portrait), `9:16` (Story/TikTok), `16:9` (Wide).
  - Multiple literary editions: *Morning Paper*, *Silent Grove*, *Blue Monolith*, and *Antique Parchment*.
  - One-click **Download Image** and **Copy to Clipboard**.

### 6. 🍃 Calming Sensory Atmosphere
- Built-in **Web Audio rain ambiance** (synthesized directly in the browser—zero external audio files or network latency).
- Subtle page turn audio cues.

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🌐 How to Publish & Deploy to Vercel

### Method 1: Via GitHub (Recommended)
1. Push this folder to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Scribe and Parchment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..." → "Project"**.
4. Select your repository. Vercel will auto-detect Vite using the included `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Your app will be live on a fast `.vercel.app` domain in ~30 seconds!

### Method 2: Via Vercel CLI
```bash
npx vercel
```
Follow the prompts to link your free Vercel account and deploy immediately from your terminal.
