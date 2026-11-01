# FACONMODS Link Generator Website

A professional, mobile-responsive web application inspired by the Sub4Unlock interface and Blogger design.

![FACONMODS Brand](https://img.shields.io/badge/FACONMODS-Pink_%26_Navy-ED568A?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Full--Stack%20Web%20(Desktop%20%7C%20Mobile%20%7C%20Tablet)-3940ED?style=for-the-badge)

---

## 🌐 Live Web Access

Your website is active and accessible directly in all browsers (Desktop Chrome/Firefox/Safari, iPad/tablets, and Android mobile browsers):

- **Development URL**: `https://ais-dev-sbzx6wdm7wdhlz3xgmtqgn-573785608714.asia-east1.run.app`
- **Public Shareable URL**: `https://ais-pre-sbzx6wdm7wdhlz3xgmtqgn-573785608714.asia-east1.run.app`

The local daemon runs on port `3000` proxied through Cloud Run / Nginx.

---

## 🎨 Design & Layout

- **Page Background**: Light gray (`#F7F8FC`)
- **Card Background**: Pure white (`#FFFFFF`)
- **Text Color**: Dark navy (`#263E5A`)
- **Header Logo**: **FACON** in navy (`#263E5A`) and **MODS** in pink (`#ED568A`) with subtle shadow underneath
- **Task Buttons**:
  - Unselected: Electric blue (`#3940ED`) with white text
  - Selected: Red/Pink (`#F04D55`) with checkmark
- **Inputs**: Rounded light gray borders (`#E2E8F0`)
- **Generate Button**: Large deep purple (`#3900EE`) with elevation
- **Responsive Layout**: Fluid flex and grid wrapping that adapts gracefully from 360px phones to 4K desktop screens.

---

## ⚡ 11 Supported Task Buttons

1. `+ Subscribe` — YouTube channel subscription
2. `+ Subscribe 2` — Secondary YouTube backup channel
3. `+ Like & Subscribe` — YouTube video like + channel subscribe
4. `+ Subscribe & Hit Bell` — Channel subscribe + notification bell
5. `+ Like & Comment` — YouTube video like + comment
6. `+ Like Video` — YouTube video like
7. `+ Follow Instagram` — Instagram profile follow
8. `+ Follow Facebook` — Facebook page/profile follow
9. `+ Follow Twitter/X` — X (Twitter) profile follow
10. `+ Join Telegram` — Telegram group/channel invite
11. `+ Join Discord` — Discord server invite

---

## 🗄️ Full-Stack Backend & Database

- **Server**: Node.js HTTP server (`server.js`) listening on `0.0.0.0:3000`.
- **Database**:
  - Server-side persistent storage: `data/campaigns.json` with atomic writes.
  - Client-side offline cache: `localStorage` (`faconmods_campaigns_db_v1`).
- **REST Endpoints**:
  - `GET /api/campaigns` — Returns all saved campaigns and statistics.
  - `POST /api/campaigns` — Validates URLs, creates campaign with unique `FM-XXXXXX` ID.
  - `GET /api/campaigns/:id` — Fetches locked campaign details.
  - `POST /api/campaigns/:id/click` — Increments visitor click counter.
  - `POST /api/campaigns/:id/unlock` — Verifies completion, increments unlock counter, and returns target destination.
  - `DELETE /api/campaigns/:id` — Deletes campaign.

---

## 🚀 How to Publish & Obtain a Custom Public Domain

You can publish this website on any free hosting platform in 2 minutes:

### Option 1: Deploy to Vercel (Recommended - Free)
1. Push this repository to GitHub (or export ZIP via the AI Studio top-right menu).
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the repository.
4. Vercel automatically detects `vercel.json` and `public/`.
5. Click **Deploy** — your live website URL will be `https://faconmods-generator.vercel.app`.

### Option 2: Deploy to Netlify (Free Drag-and-Drop)
1. Go to [netlify.com](https://app.netlify.com/drop).
2. Drag and drop the `public/` folder into the Netlify Drop box.
3. Instantly get a public URL (e.g., `https://faconmods.netlify.app`).

### Option 3: Deploy to Render (Free Web Service)
1. In Render, select **"New Web Service"**.
2. Connect your repository.
3. Render automatically picks up `render.yaml`.
4. Your website is deployed at `https://faconmods.onrender.com`.

---

## 🔒 Verification & Safety Policy

- **No Passwords**: FACONMODS never asks users for their passwords or social accounts.
- **Transparent Verification**: Due to platform API privacy rules (Google and Meta restrict reading third-party subscriptions without authorized user OAuth), tasks are verified through authenticated URL visits, active dwell checks, and explicit user confirmation.
- **Anti-Malware**: Invalid and dangerous protocols (`javascript:`, `data:`, `file:`) are strictly forbidden.
