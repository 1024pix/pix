const dayjs = require('dayjs');
const { plannerJob } = require('../../../../config').cpf;
const times = require('lodash/times');
const logger = require('../../../logger');

module.exports = async function planner({ pgBoss, cpfCertificationResultRepository, jobId }) {
  const startDate = dayjs()
    .utc()
    .subtract(plannerJob.minimumReliabilityPeriod + (plannerJob.monthsToProcess - 1), 'months')
    .startOf('month')
    .toDate();
  const endDate = dayjs().utc().subtract(plannerJob.minimumReliabilityPeriod, 'months').endOf('month').toDate();

  const certificationsCount = await cpfCertificationResultRepository.countByTimeRange({ startDate, endDate });
  const jobCount = Math.ceil(certificationsCount / plannerJob.chunkSize);
  logger.info(
    `CpfExportPlannerJob start from ${startDate} to ${endDate}, plan ${jobCount} job(s) for ${certificationsCount} certifications`
  );
  times(jobCount, (index) => {
    pgBoss.send('CpfExportBuilderJob', {
      jobId: `${jobId}#${index}`,
    });
  });
};
