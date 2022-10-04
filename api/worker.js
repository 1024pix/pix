require('dotenv').config();
const PgBoss = require('pg-boss');
const config = require('./lib/config');
const JobQueue = require('./lib/infrastructure/jobs/JobQueue');
const ParticipationResultCalculationJob = require('./lib/infrastructure/jobs/campaign-result/ParticipationResultCalculationJob');
const SendSharedParticipationResultsToPoleEmploiJob = require('./lib/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiJob');
const ParticipationResultCalculationJobHandler = require('./lib/infrastructure/jobs/campaign-result/ParticipationResultCalculationJobHandler');
const SendSharedParticipationResultsToPoleEmploiHandler = require('./lib/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiHandler');
const dependenciesBuilder = require('./lib/infrastructure/jobs/JobDependenciesBuilder');
const scheduleCpfJobs = require('./lib/infrastructure/jobs/cpf-export/schedule-cpf-jobs');

async function runJobs() {
  const pgBoss = new PgBoss({
    connectionString: process.env.DATABASE_URL,
    max: config.pgBoss.connexionPoolMaxSize,
  });
  await pgBoss.start();
  const jobQueue = new JobQueue(pgBoss, dependenciesBuilder);

  process.on('SIGINT', async () => {
    await jobQueue.stop();
    // eslint-disable-next-line node/no-process-exit
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
