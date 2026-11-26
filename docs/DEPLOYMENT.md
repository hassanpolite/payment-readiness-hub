# Deploy for free: GitHub → Vercel

This app is frontend-only (HTML, CSS, JavaScript, React). There is **no server, no database and no secret keys**, so deployment takes about 15 minutes.

---

## Part A - Push the code to GitHub

### A1. Create the repository
1. Sign in at https://github.com (create a free account if needed).
2. Click **+** → **New repository**. Name: `payment-readiness-hub`, **Public**, and do **NOT** tick "Add a README", ".gitignore" or "license".
3. Click **Create repository** and copy the URL, e.g. `https://github.com/YOUR-USERNAME/payment-readiness-hub.git`.

### A2. Tell Git who you are (once per computer)
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### A3. Commit and push
Open a terminal **in the `payment-readiness-hub` folder** (VS Code: *Terminal → New Terminal*):
```bash
git init
git status
```
Check the list: `node_modules/` and `dist/` must **not** appear (`.gitignore` hides them).
```bash
git add .
git commit -m "Initial commit: Payment Readiness Hub"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/payment-readiness-hub.git
git push -u origin main
```

| Command | What it does |
|---|---|
| `git init` | Turns the folder into a Git repository |
| `git add .` | Stages every file not listed in `.gitignore` |
| `git commit -m "..."` | Saves a snapshot with a message |
| `git branch -M main` | Names the branch `main` |
| `git remote add origin URL` | Links your folder to the GitHub repository |
| `git push -u origin main` | Uploads your commits; afterwards just type `git push` |

If you're asked to log in, use the browser sign-in. If asked for a password, use a GitHub **Personal Access Token** (Settings → Developer settings → Personal access tokens), not your account password.

**Later changes:** `git add .` → `git commit -m "What changed"` → `git push`. Vercel redeploys automatically.

| Git error | Fix |
|---|---|
| `remote origin already exists` | `git remote set-url origin https://github.com/YOU/payment-readiness-hub.git` |
| `rejected (fetch first)` | You created the repo with a README: `git pull origin main --allow-unrelated-histories`, then `git push` |
| `src refspec main does not match any` | Run `git add .` and `git commit` first |
| `Permission denied` / `403` | Sign in with the right account or use a Personal Access Token |

---

## Part B - Deploy on Vercel

1. Go to https://vercel.com → **Sign Up** → **Continue with GitHub**.
2. **Add New...** → **Project** → **Import** `payment-readiness-hub`.
3. Vercel detects **Vite** automatically. Check:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `./` (leave as is) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variables | none needed |

4. Click **Deploy**. After about a minute you get a public URL like `https://payment-readiness-hub.vercel.app`.
5. Open it, click **Explore with sample data**, and refresh a page such as `/invoices`. `vercel.json` makes refreshes work instead of showing a 404.

### Alternative: Netlify
Netlify → **Add new site** → **Import from Git** → choose the repo → Build command `npm run build`, Publish directory `dist` → Deploy. `public/_redirects` handles page refreshes.

---

## Optional: AI answers

Nothing to configure on the server. Each user can add their own free key from https://console.groq.com/keys in the app's **Settings** page. It is stored only in their browser. For your demo, add your key on your own laptop's browser before presenting, and remove it afterwards on any shared computer.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Build fails on Vercel with "vite: not found" | Make sure `package.json` and `package-lock.json` are committed, then redeploy |
| Refreshing a page shows 404 | `vercel.json` (Vercel) or `public/_redirects` (Netlify) is missing from the repo |
| Data disappeared | Data lives in each browser. Clearing site data or using another browser/device starts empty. Use Settings → Export/Import backup |
| AI answer shows "key was rejected" | Copy the key again from console.groq.com (starts with `gsk_`) |
| AI answer shows "free-tier limit reached" | Wait a minute; the app shows matching guides meanwhile |

## Free-tier notes

- **Vercel Hobby:** free for personal and non-commercial projects; no sleeping, so the site is always instant.
- **Groq free tier:** per-minute and per-day limits; the app falls back to guide search automatically.
