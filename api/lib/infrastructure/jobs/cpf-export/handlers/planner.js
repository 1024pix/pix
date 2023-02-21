const dayjs = require('dayjs');
const { plannerJob } = require('../../../../config').cpf;
const _ = require('lodash');

module.exports = async function planner({ job, pgBoss, cpfCertificationResultRepository, logger }) {
  const startDate = dayjs()
    .utc()
    .subtract(plannerJob.minimumReliabilityPeriod + (plannerJob.monthsToProcess - 1), 'months')
    .startOf('month')
    .toDate();
  const endDate = dayjs().utc().subtract(plannerJob.minimumReliabilityPeriod, 'months').endOf('month').toDate();

  const certificationCourseIds = await cpfCertificationResultRepository.getIdsByTimeRange({ startDate, endDate });
  const certificationCourseIdChunks = _.chunk(certificationCourseIds, plannerJob.chunkSize);
  logger.info(
    `CpfExportPlannerJob start from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}, plan ${
      certificationCourseIdChunks.length
    } job(s) for ${certificationCourseIds.length} certifications`
  );

  for (const [index, certificationCourseIds] of certificationCourseIdChunks.entries()) {
    const batchId = `${job.id}#${index}`;
    await cpfCertificationResultRepository.markCertificationToExport({
      certificationCourseIds,
      batchId,
    });

    await pgBoss.send('CpfExportBuilderJob', {
      batchId,
    });
  }
};
