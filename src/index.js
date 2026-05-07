require('dotenv').config();
const express = require('express');
const buildRouter = require('./routes/build');

if (!process.env.API_PASSWORD) {
  console.error('API_PASSWORD not set in .env — exiting');
  process.exit(1);
}

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/build', buildRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`docker-image-creator listening on port ${PORT}`));
