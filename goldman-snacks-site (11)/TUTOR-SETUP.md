# Switching on the AI tutor on your own site

The tutor needs a small server function that keeps your Anthropic API key private. Netlify only runs server functions when the site is deployed from GitHub (not drag-and-drop), so this is a one-time move to GitHub. No terminal needed.

## 1. Put the site on GitHub (5 minutes)
1. Make a free account at github.com.
2. Click **New repository**. Name it `goldman-snacks`. Private is fine. Click **Create repository**.
3. On the next page click **uploading an existing file**.
4. Unzip `goldman-snacks-site.zip`, open the folder, select everything inside it (including the `netlify` folder and `netlify.toml`) and drag it onto the GitHub page.
5. Click **Commit changes**.

## 2. Get an Anthropic API key (5 minutes)
1. Go to console.anthropic.com and sign up.
2. **Billing**: add credit (the minimum, around $5, lasts a long time: each question costs roughly 1–2p).
3. **Limits**: set a monthly spend limit, for example $5, so you can never be surprised.
4. **API keys** → **Create key**. Copy it (it starts `sk-ant-`). Keep it secret.

## 3. Connect Netlify to GitHub (5 minutes)
1. In Netlify: **Add new project** → **Import an existing project** → **GitHub** → choose `goldman-snacks`.
2. Leave the build command empty. The publish directory is set by `netlify.toml`.
3. Before deploying, open **Environment variables** and add:
   - `ANTHROPIC_API_KEY` = your key from step 2
   - `TUTOR_PASSCODE` = a word only you know (the chat asks for it once per device)
   - optional: `TUTOR_MODEL` = `claude-haiku-4-5-20251001` for a cheaper, faster tutor (the default is `claude-sonnet-5-5`)
4. Click **Deploy**. Open the new site, click **Ask a tutor**, enter your passcode.

To update the site later, upload changed files to the GitHub repository (or ask Claude to push them if you connect GitHub in claude.ai settings). Netlify redeploys automatically.
