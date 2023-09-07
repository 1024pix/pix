import { fileURLToPath } from 'node:url';

import { knex, disconnect } from '../../db/knex-database-connection.js';

const modulePath = fileURLToPath(import.meta.url);
const IS_LAUNCHED_FROM_CLI = process.argv[1] === modulePath;

const TIMER_NAME = 'user-logins-last-logged-at-missing-part-syncing';

async function main() {
  console.time(TIMER_NAME);
  console.log('Starting user-logins-last-logged-at syncing for non-existent user-logins …');

  await syncUserLoginsLastLoggedAt();

  console.timeEnd(TIMER_NAME);
}

async function syncUserLoginsLastLoggedAt() {
  await knex.raw(`
  INSERT INTO "user-logins"
  ("userId", "lastLoggedAt")
  SELECT "id", "lastLoggedAt"
  FROM "users"
  WHERE "lastLoggedAt" IS NOT NULL
  ON CONFLICT ("userId") DO NOTHING
  ;
  `);
}

if (IS_LAUNCHED_FROM_CLI) {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}
