const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');

function run(cmd, args, { input, ...spawnOpts } = {}) {
  return new Promise((resolve, reject) => {
    const stdio = input !== undefined ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe'];
    const proc = spawn(cmd, args, { ...spawnOpts, stdio });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', d => { stdout += d; });
    proc.stderr.on('data', d => { stderr += d; });

    proc.on('close', code => {
      if (code !== 0) reject(new Error(`${cmd} exited ${code}: ${stderr.trim()}`));
      else resolve({ stdout, stderr });
    });

    proc.on('error', err => reject(new Error(`Failed to spawn ${cmd}: ${err.message}`)));

    if (input !== undefined) {
      proc.stdin.write(input);
      proc.stdin.end();
    }
  });
}

async function buildAndPush({ repo, dockerfile, imageName }) {
  const { REGISTRY_URL, REGISTRY_USERNAME, REGISTRY_PASSWORD } = process.env;
  if (!REGISTRY_URL) throw new Error('REGISTRY_URL not set');
  if (!REGISTRY_USERNAME) throw new Error('REGISTRY_USERNAME not set');
  if (!REGISTRY_PASSWORD) throw new Error('REGISTRY_PASSWORD not set');

  const tmpDir = path.join(os.tmpdir(), `dic-${crypto.randomBytes(8).toString('hex')}`);

  try {
    console.log(`[build] Logging in to ${REGISTRY_URL}`);
    await run('docker', ['login', REGISTRY_URL, '-u', REGISTRY_USERNAME, '--password-stdin'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      input: REGISTRY_PASSWORD,
    });

    console.log(`[build] Cloning ${repo}`);
    await run('git', ['clone', '--depth', '1', repo, tmpDir]);

    const dockerfilePath = path.resolve(tmpDir, dockerfile);
    if (!dockerfilePath.startsWith(tmpDir + path.sep) && dockerfilePath !== tmpDir) {
      throw new Error('dockerfile path escapes repository root');
    }

    const fullImage = `${REGISTRY_URL}/${imageName}`;

    console.log(`[build] Building ${fullImage}`);
    await run('docker', ['build', '-f', dockerfilePath, '-t', fullImage, tmpDir]);

    console.log(`[build] Pushing ${fullImage}`);
    await run('docker', ['push', fullImage]);

    return { image: fullImage };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

module.exports = { buildAndPush };
