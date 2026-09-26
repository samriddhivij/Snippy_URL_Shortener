# URL Shortener

A server-rendered URL shortener built with Node.js and Express. Signed-in users can create short links with optional custom aliases and passwords, download a QR code for a new link, and see click counts for links they created. An admin view lists links across all users.

## Features

- **Short links:** Generate an ID or choose a custom alias (up to 20 characters).
- **Protected links:** Optionally require a password before redirecting; link passwords are hashed with bcrypt.
- **QR codes:** Generate a downloadable QR code when a link is created.
- **Click counts:** Queue visits in Redis, show pending visits alongside saved visits, and batch them into MongoDB every three minutes.
- **Accounts and roles:** Sign up and log in using a JWT stored in an HTTP-only cookie. The dashboard shows each user's links; an `ADMIN` role can view all links.
- **Creation limit:** Limit each client to five link creation requests per 10 minutes.

## Tech stack

| Layer | Tools |
| --- | --- |
| Server and UI | Node.js, Express, EJS, CSS |
| Database | MongoDB, Mongoose |
| Cache and visit queue | Redis, ioredis |
| Authentication | JSON Web Tokens, cookies |
| Other | bcrypt, shortid, qrcode, express-rate-limit |

## Run locally

### Prerequisites

- Node.js **20.19.0 or newer** and npm (required by the installed Mongoose version)
- MongoDB running locally at `mongodb://127.0.0.1:27017`
- A Redis connection URL with TLS support (the Redis client is configured for Upstash-style TLS connections)

### Setup

1. Extract `URL SHORTENER.zip` and open its `URL SHORTENER` directory, which contains `package.json` and `index.js`.
2. Install dependencies:

   ```bash
   npm ci
   ```

3. Create a `.env` file in that directory:

   ```dotenv
   SERVER_SECRET=replace-with-a-long-random-secret
   Redis_api=rediss://username:password@your-redis-host:port
   ```

   `SERVER_SECRET` signs login tokens. `Redis_api` is the Redis URL read by `redisClient.js`. Keep the `.env` file private; it is excluded by `.gitignore`.

4. Start the server:

   ```bash
   node index.js
   ```

5. Visit **http://localhost:8004/signup**, create an account, and log in. The dashboard is at **http://localhost:8004/**.

The MongoDB address, port (`8004`), and generated short-link base URL (`http://localhost:8004`) are currently set in source code. Update `index.js` and `controllers/url.js` if you change them.

## Use the app

1. Enter a destination URL on the dashboard. You can add a custom alias and a link password.
2. Select **Generate** to get the short URL and a QR code you can download.
3. Open `/url/<shortId>` to follow the link. The dashboard's **Total Clicks** column combines visits already saved in MongoDB with visits still queued in Redis.

New accounts receive the `NORMAL` role. The admin overview at `/admin/urls` requires an account whose `role` is `ADMIN` in the `users` collection; log in again after changing the role so the JWT contains the new role. The current `/url` creation route accepts `NORMAL` accounts.

## Routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/signup`, `/login` | Show account forms |
| `POST` | `/user` | Create an account |
| `POST` | `/user/login`, `/user/logout` | Start or end a session |
| `GET` | `/` | Show the signed-in user's links and click counts |
| `GET` | `/admin/urls` | Show all links to an admin |
| `POST` | `/url` | Create a short link (signed-in `NORMAL` account) |
| `GET` | `/url/:shortId` | Redirect, or show a password prompt |
| `POST` | `/url/:shortId/verify` | Check a protected link's password and redirect |

The form routes accept URL-encoded data. `POST /url` expects `query` (destination URL) and accepts `customAlias` and `password` as optional form fields. The link creation form supplies an empty `customAlias` value when it is unused.

## Project layout

```text
controllers/    Link creation, password verification, signup and login
middleware/     Authentication, rate limiting, redirects and visit syncing
models/         MongoDB user and URL schemas
routes/         Page, user and URL routes
service/        JWT signing and verification
views/          EJS pages
public/         CSS styles
connection.js   MongoDB connection helper
redisClient.js  Redis client
index.js        Express setup and server entry point
```
