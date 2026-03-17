<img src="./LightTrail.png" alt="LightTrail logo">

# LightTrail

A lightweight tool for adding collaborative annotations to any webpage. Highlight text, leave comments, and see updates from other users in real time — all without modifying the page's source code.

> **Note:** LightTrail is intended as a development and review tool. Remove the script tag before publishing your website to end users.

---

## How it works

LightTrail is a single JavaScript file injected into a webpage via a `<script>` tag. It connects to a self-hosted Express backend that stores comments in a PostgreSQL database and broadcasts real-time updates over WebSockets.

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Iced-Code/LightTrail.git
cd LightTrail
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env` and fill in your database connection string:

```
POSTGRESQL_PASSWORD=your_password
HOST=localhost
BACKEND_PORT=3000
```

### 4. Start the server

```bash
npm start
```

The server starts at `http://localhost:3000`. The database table is created automatically on first run.

---

## Adding LightTrail to a webpage

Add the following script tag to any HTML page you want to annotate:

```html
<script src="http://localhost:3000/lighttrail.js"></script>
```

Replace `http://localhost:3000` with your server's address if it is hosted elsewhere.

That's it. Refresh the page and a **LightTrail** button will appear in the bottom-right corner.

---

## Usage

1. Highlight a part of the website you want to leave a comment on.
2. Enter your requested change, question, or feedback.
3. Drag your comment box to reposition on the screen and click "Comment" to save.
4. View and toggle view all comments via the LightTrail panel in the bottom right corner.

Comments are colour-coded: **red** for your own comments, **yellow** for comments from other users.

Real-time updates are shared automatically — any comment added or deleted by another user on the same page will appear instantly without a page refresh.

---

## Project structure

```
LightTrail/
├── app.js          # Express + WebSocket server
├── db.js           # PostgreSQL connection pool
├── lighttrail.js   # Client-side script (injected into webpages)
└── .env.example    # Environment variable template
```

---

## Configuration

All client-side URLs are set at the top of `lighttrail.js`:

```js
const LT_SERVER = "http://localhost:3000";
const LT_WS     = "ws://localhost:3000";
```

Change these to point to your server's address if it is not running locally.

---

## Notes

- LightTrail is disabled automatically on mobile devices and narrow windows (below 768px).
- Comments are scoped per page URL, so annotations on one page do not appear on others.
- Each browser is assigned a random anonymous ID stored in `localStorage`. There is no login system.

---

## Author

Developed by Ayaan Modak — [GitHub](https://github.com/Iced-code)