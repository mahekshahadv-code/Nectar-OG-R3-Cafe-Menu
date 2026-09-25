# Nectar OG R3 Cafe — Online Menu & Ordering

A mobile-first cafe ordering site for Nectar OG R3 Cafe, a co-brand of Juice Katey.

## Stack
- React + Vite
- Firebase Authentication (owner login)
- Firestore (editable menu + live orders)
- Vercel (recommended frontend hosting)
- qrcode.react (permanent menu QR)

## Routes
- `/menu` — customer menu
- `/menu?table=7` — table-specific customer menu
- `/owner/login` — owner login
- `/owner` — owner dashboard

## 1. Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL shown by Vite.

## 2. Firebase setup

Create a Firebase project and enable:
- Authentication → Email/Password
- Firestore Database

Create one Authentication user for the cafe owner.
Then create this Firestore document:

`owners/{OWNER_UID}`

```json
{ "role": "owner", "name": "Cafe Owner" }
```

Put the Firebase web app configuration into `.env` using the names in `.env.example`.

Deploy Firestore rules from the project directory if using Firebase CLI:

```bash
firebase login
firebase use --add
firebase deploy --only firestore
```

## 3. First-time menu setup

Log in at `/owner/login`, open **Menu & Prices**, and click **Load starter menu**.

This loads the prepared Nectar OG R3 Cafe menu and starting prices. Every price, item, category and availability flag is editable afterwards.

## 4. Vercel deployment

1. Create a GitHub repository and upload this project.
2. In Vercel, import the GitHub repository.
3. Framework: Vite (Vercel normally detects this automatically).
4. Add the six `VITE_FIREBASE_*` environment variables from `.env` to Vercel Project Settings → Environment Variables.
5. Deploy.

The included `vercel.json` keeps `/menu`, `/owner/login` and `/owner` working on refresh.

## 5. Permanent QR

After deployment, open `/owner`, go to **Permanent QR** and use the displayed QR for the customer menu.

For table-specific QR codes, use the same domain with a query parameter:
- `/menu?table=1`
- `/menu?table=2`
- `/menu?table=3`

The checkout automatically carries the table number into the order.

## 6. Important production notes

- Keep the same public domain and `/menu` route after printing the main QR.
- Firebase client configuration values are designed to be used in the browser; Firestore Security Rules protect the data.
- Only accounts present in `owners` can access owner data.
- Customers can create orders but cannot read or modify existing orders.
