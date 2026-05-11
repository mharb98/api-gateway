'use strict';

const { execSync } = require('child_process');

const reset = process.argv.includes('--reset') ? ' --reset' : '';

const command = [
  'cross-env TS_NODE_PROJECT=tsconfig.typeorm.json',
  `ts-node database/seeds/seed.ts${reset}`,
].join(' ');

console.log(`Running: ${command}`);
execSync(command, { stdio: 'inherit' });
