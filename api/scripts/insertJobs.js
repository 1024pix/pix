import lodash from 'lodash';

import { knex } from '../db/knex-database-connection.js';

const { range } = lodash;

const JOBS_COUNT = process.argv[2];
const USER_ID = process.argv[3];
const MAX = process.argv[4];

let seconds = 1;
const max = MAX;
const intervalId = setInterval(async () => {
  console.log('batch: ' + seconds);

  const jobs = range(Math.ceil(JOBS_COUNT / max)).map(() => ({
    name: 'answer',
    data: { userId: USER_ID },
    on_complete: true,
  }));

  await knex.batchInsert('pgboss.job', jobs);

  seconds++;

  if (seconds > max) {
    console.log('exit');
    clearInterval(intervalId);
    return process.exit();
  }
}, 1000);
