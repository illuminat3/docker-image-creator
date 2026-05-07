const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { buildAndPush } = require('../services/docker');

const REPO_RE = /^https?:\/\/.+/;
const IMAGE_RE = /^[a-z0-9][a-z0-9._\-/:]*$/i;

router.post('/', auth, async (req, res) => {
  const { repo, dockerfile = 'Dockerfile', imageName } = req.body;

  if (!repo || !REPO_RE.test(repo)) {
    return res.status(400).json({ error: 'repo must be a valid http/https URL' });
  }
  if (!imageName || !IMAGE_RE.test(imageName)) {
    return res.status(400).json({ error: 'imageName must be a valid Docker image name' });
  }

  try {
    const result = await buildAndPush({ repo, dockerfile, imageName });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
