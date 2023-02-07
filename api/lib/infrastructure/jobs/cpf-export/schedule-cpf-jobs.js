const handlers = require('./');
const logger = require('../../logger');
const { plannerJob, sendEmailJob } = require('../../../config').cpf;

module.exports = async function scheduleCpfJobs(pgBoss) {
  await pgBoss.schedule('CpfExportPlannerJob', plannerJob.cron, null, { tz: 'Europe/Paris' });

  await pgBoss.work('CpfExportPlannerJob', async (job) => {
    await _processJob(job, handlers.planner, { pgBoss });
  });

  await pgBoss.work('CpfExportBuilderJob', { batchSize: 1 }, async ([job]) => {
    await _processJob(job, handlers.createAndUpload, { data: job.data });
  });

  await pgBoss.schedule('CpfExportSenderJob', sendEmailJob.cron, null, { tz: 'Europe/Paris' });
  await pgBoss.work('CpfExportSenderJob', async (job) => {
    await _processJob(job, handlers.sendEmail, {});
  });
};

async function _processJob(job, handler, params) {
  try {
    await handler({ ...params, job, logger: buildLogger(job) });
    job.done();
  } catch (error) {
    job.done(error);
  }
}

function buildLogger(job) {
  const handlerName = job.name;
  const jobId = job.id;
  return {
    info: (message, ...args) => logger.info({ ...args, handlerName, jobId, type: 'JOB_LOG', message }),
    error: (message, ...args) => logger.error({ ...args, handlerName, jobId, type: 'JOB_ERROR', message }),
  };
}
