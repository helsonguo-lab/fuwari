// No network-executed npx preinstall helper: use the version pinned by the repo.
const expected = require('../package.json').packageManager;
const actual = (process.env.npm_config_user_agent || '').split(' ')[0].replace('/', '@');
if (actual !== expected) {
  console.error(`Use ${expected} (received ${actual || 'unknown package manager'}).`);
  process.exit(1);
}
