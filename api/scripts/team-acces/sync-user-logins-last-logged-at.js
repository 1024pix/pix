import { fileURLToPath } from 'node:url';

import { knex, disconnect } from '../../db/knex-database-connection.js';

const modulePath = fileURLToPath(import.meta.url);
const IS_LAUNCHED_FROM_CLI = process.argv[1] === modulePath;

const TIMER_NAME = 'user-logins-last-logged-at-syncing';

async function main() {
  console.time(TIMER_NAME);
  console.log('Starting user-logins-last-logged-at syncing…');

  await syncUserLoginsLastLoggedAt();

  console.timeEnd(TIMER_NAME);
}

async function syncUserLoginsLastLoggedAt() {
  await knex.raw(`
  UPDATE "user-logins" t2
  SET "lastLoggedAt" = t1."lastLoggedAt"
  FROM "users" t1
    WHERE t1."id" = t2."userId"
    AND t2."lastLoggedAt" IS NULL
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
