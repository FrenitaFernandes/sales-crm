const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (full.includes('node_modules') || full.includes('.git')) continue;
    if (e.isDirectory()) {
      walk(full, cb);
    } else {
      cb(full);
    }
  }
}

const startRe = /^<{7}/;
const midRe = /^={7}$/;
const endRe = /^>{7}/;
let found = false;
walk(root, (file) => {
  const ext = path.extname(file).toLowerCase();
  if (!['.js', '.jsx', '.json', '.css', '.md', '.html'].includes(ext)) return;
  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (startRe.test(line) || midRe.test(line) || endRe.test(line)) {
        console.log(`${file}:${idx+1}: ${line}`);
        found = true;
      }
    });
  } catch (err) {
    // ignore
  }
});
if (!found) console.log('No conflict markers found.');
