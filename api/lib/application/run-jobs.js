require('dotenv').config();
const JobQueue = require('../infrastructure/jobs/JobQueue');
const ParticipationResultCalculationJob = require('../infrastructure/jobs/campaign-result/ParticipationResultCalculationJob');
const ParticipationResultCalculationJobHandler = require('../infrastructure/jobs/campaign-result/ParticipationResultCalculationJobHandler');
const dependenciesBuilder = require('../infrastructure/events/DependenciesBuilder');
const PgBoss = require('pg-boss');

async function runJobs() {
  // eslint-disable-next-line node/no-process-env
  const pgBoss = new PgBoss(process.env.DATABASE_URL);
  await pgBoss.start();
  const jobQueue = new JobQueue(pgBoss, dependenciesBuilder);

  process.on('SIGINT', async () => {
    await jobQueue.stop();
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  });

  await jobQueue.performJob(ParticipationResultCalculationJob.name, ParticipationResultCalculationJobHandler);
}

runJobs();
