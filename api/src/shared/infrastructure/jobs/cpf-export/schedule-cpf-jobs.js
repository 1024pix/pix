import { config } from '../../../config.js';
import { logger } from '../../utils/logger.js';
import { cpfExport } from './index.js';
const { plannerJob, sendEmailJob } = config.cpf;

const { planner } = cpfExport;

const scheduleCpfJobs = async function (pgBoss) {
  await pgBoss.schedule('CpfExportPlannerJob', plannerJob.cron, null, { tz: 'Europe/Paris' });

  await pgBoss.work('CpfExportPlannerJob', async (job) => {
    await _processJob(job, planner, { pgBoss });
  });

  await pgBoss.schedule('CpfExportSenderJob', sendEmailJob.cron, null, { tz: 'Europe/Paris' });
};

export { scheduleCpfJobs };

async function _processJob(job, handler, params) {
  try {
    await handler({ ...params, job, logger: buildLogger(job) });
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

function buildLogger(job) {
  const handlerName = job.name;
  const jobId = job.id;
  return {
    info: (message, ...args) => logger.info({ ...args, handlerName, jobId, type: 'JOB_LOG', message }),
    error: (message, ...args) => logger.error({ ...args, handlerName, jobId, type: 'JOB_ERROR', message }),
    trace: (message, ...args) => logger.trace({ ...args, handlerName, jobId, type: 'JOB_TRACE', message }),
  };
}
