const dayjs = require('dayjs');
const { plannerJob } = require('../../../../config').cpf;
const logger = require('../../../logger');
const _ = require('lodash');

module.exports = async function planner({ pgBoss, cpfCertificationResultRepository, jobId }) {
  const startDate = dayjs()
    .utc()
    .subtract(plannerJob.minimumReliabilityPeriod + (plannerJob.monthsToProcess - 1), 'months')
    .startOf('month')
    .toDate();
  const endDate = dayjs().utc().subtract(plannerJob.minimumReliabilityPeriod, 'months').endOf('month').toDate();

  const certificationCourseIds = await cpfCertificationResultRepository.getIdsByTimeRange({ startDate, endDate });
  const certificationCourseIdChunks = _.chunk(certificationCourseIds, plannerJob.chunkSize);
  logger.info(
    `CpfExportPlannerJob start from ${startDate} to ${endDate}, plan ${certificationCourseIdChunks.length} job(s) for ${certificationCourseIds.length} certifications`
  );
  for (const [index, certificationCourseIdChunk] of certificationCourseIdChunks.entries()) {
    const batchId = `${jobId}#${index}`;
    await cpfCertificationResultRepository.markCertificationToExport(certificationCourseIdChunk, batchId);
    pgBoss.send('CpfExportBuilderJob', {
      jobId: batchId,
    });
  }
};
