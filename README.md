# ENT 321 CBT Practice App

A free, static Computer-Based Test (CBT) practice app for **ENT 321 – Venture Creation** (300 questions, 8 chapters). Built with plain HTML, CSS and JavaScript — no server, no database, no build step. Works entirely in the browser and can be hosted for free on **GitHub Pages**.

## Features
- Login page (name + registration number) before the test starts
- Questions organized into **8 chapter sections** — students click a chapter to load only that chapter's questions
- **30-minute timer** per chapter test (auto-submits when time runs out)
- Instant scoring at the end, with a correct/incorrect/unanswered breakdown
- "Review Answers" view that shows the correct answer for every question
- Contact footer with your support email and WhatsApp number

## Files
```
index.html      → the app's structure (login, chapter list, test, results)
style.css       → all styling
questions.js    → the 300 questions + answers, grouped by chapter (auto-generated data)
app.js          → all the app logic (timer, scoring, navigation)
```

## How to put this on GitHub (step by step)

1. **Create a new repository** on GitHub (e.g. `ent321-cbt`).
   - Go to https://github.com/new
   - Name it whatever you like, keep it **Public**
   - Don't add a README/gitignore (you already have files) — click **Create repository**

2. **Upload the files**
   - On your new repo page, click **"uploading an existing file"**
   - Drag in `index.html`, `style.css`, `questions.js`, and `app.js`
   - Scroll down and click **Commit changes**

3. **Turn on GitHub Pages**
   - In your repo, go to **Settings → Pages** (left sidebar)
   - Under "Build and deployment" → **Source**, choose **Deploy from a branch**
   - Branch: `main`, Folder: `/ (root)` → click **Save**

4. **Wait ~1 minute**, then refresh that Pages settings page. You'll see a link like:
   ```
   https://yourusername.github.io/ent321-cbt/
   ```
   That's your live CBT app — share that link with your students.

## Editing the questions
All 300 questions live inside `questions.js` as a single JavaScript array called `CBT_DATA`. Each chapter is an object:
```js
{
  "title": "Chapter 1: Venture Creation and Growth",
  "questions": [
    { "id": 1, "question": "...", "options": {"A": "...", "B": "...", "C": "...", "D": "..."}, "answer": "B" },
    ...
  ]
}
```
To fix a typo or change an answer, just edit that entry directly in `questions.js` and re-upload/commit the file — GitHub Pages updates automatically within a minute or two.

## Notes
- No backend, no payment, no accounts — a student's name/reg number is only stored in their own browser (localStorage) so they don't have to re-type it if they return.
- Everything runs client-side, so it's completely free to host on GitHub Pages.
- Contact: bsaviourokon@gmail.com · WhatsApp 0912 739 6493
