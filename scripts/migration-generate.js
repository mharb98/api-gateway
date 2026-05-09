'use strict';

const { execSync } = require('child_process');

const nameArg = process.argv.find((arg) => arg.startsWith('--name='));
if (!nameArg) {
  console.error('Error: --name=<MigrationName> argument is required.');
  process.exit(1);
}

const name = nameArg.split('=')[1];
if (!name || name.trim() === '') {
  console.error('Error: Migration name cannot be empty.');
  process.exit(1);
}

const command = [
  'cross-env TS_NODE_PROJECT=tsconfig.typeorm.json',
  'typeorm-ts-node-commonjs migration:generate',
  `database/migrations/${name}`,
  '-d src/configs/typeorm.config.ts',
].join(' ');

console.log(`Running: ${command}`);
execSync(command, { stdio: 'inherit' });
