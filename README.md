# Harmony Music Academy — Website

A static, GitHub Pages–ready site for Harmony Music Academy. No backend server,
no database to maintain — content for **Latest News**, **Testimonials**,
**Courses**, and **Pricing** is pulled live from your Google Sheet every time
a page loads.

## 1. Project structure

```
harmony-academy/
├── index.html        Home — hero, latest news, testimonials
├── about.html         About Us
├── courses.html        Courses (reads the "Courses" tab)
├── pricing.html        Pricing (reads the "Pricing" tab)
├── css/
│   └── style.css        All design/styling
├── js/
│   ├── config.js         Sheet ID, tab names, student portal URL
│   ├── sheets.js          Generic Google Sheet → JSON reader
│   ├── main.js            Shared header/footer, mobile nav, video modal
│   ├── home.js            Renders News + Testimonials
│   ├── courses.js         Renders Courses
│   └── pricing.js         Renders Pricing
└── assets/
    ├── logo.png           Full logo (used as favicon/og-image source)
    └── logo-icon.png       Cropped guitar mark (used in the nav/footer)
```

## 2. How the data layer works (no backend needed)

Your Google Sheet **is** the backend. The site fetches it read-only at
runtime using Google's public "visualization query" endpoint — no API key,
no server, no build step required.

**One-time setup — make the sheet readable by the site:**
1. Open your sheet → **Share** (top-right)
2. Under "General access," choose **Anyone with the link**
3. Set the role to **Viewer**
4. Click **Done**

That's it. From then on:
- Edit a row in the sheet → refresh the live site → the change is there.
- No redeploy, no code change, no waiting.

The tab names the code expects (already set in `js/config.js`):
| Tab | Columns expected |
|---|---|
| `Latest News` | Date, Title, Subtitle, Description |
| `Testimonials` | Name, Review, Rating, Link (Drive video URL, optional per row) |
| `Courses` | Any columns — first column becomes the card title, the rest are listed as details automatically |
| `Pricing` | Level, Price, Perks (one perk per line, or comma-separated) |

If you ever rename a tab, update the matching value in `js/config.js`.

### Adding video testimonials
For any row in `Testimonials` that should have a "Watch video" button:
1. Open the video file in Google Drive
2. **Share** → set to **Anyone with the link → Viewer**
3. Paste that link into the `Link` column for that row

The site extracts the file ID automatically and plays it in a pop-up — it
doesn't matter which Drive link format you paste.

### About Us page
Your Google Sheet doesn't currently have an "About" tab, so `about.html`
ships with clearly-marked placeholder copy and a 3-instructor layout you can
edit directly in the HTML (look for `<!-- EDIT ME -->` comments). Send me your
real mission statement, stats, and instructor bios/photos whenever you're
ready and I'll wire it up properly (either hardcoded or as a 5th Google Sheet
tab, your choice).

## 3. Hosting on GitHub Pages

1. Create a new repository on GitHub (e.g. `harmony-academy`)
2. Upload everything in this folder to the repo (drag-and-drop on
   github.com works fine, or via git):
   ```
   git init
   git add .
   git commit -m "Launch Harmony Music Academy site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/harmony-academy.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages**
4. Under "Build and deployment," set **Source** to "Deploy from a branch"
5. Branch: `main`, folder: `/ (root)` → **Save**
6. Your site goes live in a minute or two at:
   `https://YOUR_USERNAME.github.io/harmony-academy/`

**Custom domain (optional):** Settings → Pages → "Custom domain" → enter your
domain → add the CNAME record your registrar gives you. GitHub will create a
`CNAME` file in the repo automatically.

## 4. The "Login as Student" button

Already wired up in `js/config.js` to your Google Apps Script portal URL. To
change it later, edit one line:
```js
STUDENT_PORTAL_URL: 'https://your-new-link-here',
```

## 5. Updating in the future
- **Content (news, testimonials, courses, pricing):** edit the Google Sheet.
- **Design/copy/structure changes:** edit the HTML/CSS/JS files and push to
  GitHub — Pages redeploys automatically within a minute or two.
