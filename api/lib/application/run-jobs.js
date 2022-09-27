require('dotenv').config();
const config = require('../../lib/config');
const JobQueue = require('../infrastructure/jobs/JobQueue');
const ParticipationResultCalculationJob = require('../infrastructure/jobs/campaign-result/ParticipationResultCalculationJob');
const SendSharedParticipationResultsToPoleEmploiJob = require('../infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiJob');
const ParticipationResultCalculationJobHandler = require('../infrastructure/jobs/campaign-result/ParticipationResultCalculationJobHandler');
const SendSharedParticipationResultsToPoleEmploiHandler = require('../infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiHandler');
const dependenciesBuilder = require('../infrastructure/jobs/JobDependenciesBuilder');
const PgBoss = require('pg-boss');
const scheduleCpfJobs = require('../infrastructure/jobs/cpf-export/schedule-cpf-jobs');

async function runJobs() {
  const pgBoss = new PgBoss({
    // eslint-disable-next-line node/no-process-env
    connectionString: process.env.DATABASE_URL,
    max: config.pgBoss.connexionPoolMaxSize,
  });
  await pgBoss.start();
  const jobQueue = new JobQueue(pgBoss, dependenciesBuilder);

  process.on('SIGINT', async () => {
    await jobQueue.stop();
    // eslint-disable-next-line node/no-process-exit,no-process-exit
    process.exit(0);
  });

  jobQueue.performJob(ParticipationResultCalculationJob.name, ParticipationResultCalculationJobHandler);
  jobQueue.performJob(
    SendSharedParticipationResultsToPoleEmploiJob.name,
    SendSharedParticipationResultsToPoleEmploiHandler
  );

  await scheduleCpfJobs(pgBoss);
}

runJobs();
