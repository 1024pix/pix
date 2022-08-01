const handlers = require('./');
const { plannerJob } = require('../../../config').cpf;

module.exports = async function scheduleCpfJobs(pgBoss) {
  await pgBoss.schedule('CpfExportPlannerJob', plannerJob.cron, null, { tz: 'Europe/Paris' });

  await pgBoss.work('CpfExportPlannerJob', async (job) => {
    await _processJob(job, handlers.planner, { pgBoss });
  });

  await pgBoss.work('CpfExportBuilderJob', { batchSize: 1 }, async ([job]) => {
    await _processJob(job, handlers.createAndUpload, { data: job.data });
  });
};

async function _processJob(job, handler, params) {
  try {
    await handler({ ...params });
    job.done();
  } catch (error) {
    job.done(error);
  }
}
