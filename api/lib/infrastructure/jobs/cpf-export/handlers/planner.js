const dayjs = require('dayjs');
const { plannerJob } = require('../../../../config.js').cpf;

module.exports = async function planner({ job, pgBoss, cpfCertificationResultRepository, logger }) {
  const startDate = dayjs()
    .utc()
    .subtract(plannerJob.minimumReliabilityPeriod + (plannerJob.monthsToProcess - 1), 'months')
    .startOf('month')
    .toDate();
  const endDate = dayjs().utc().subtract(plannerJob.minimumReliabilityPeriod, 'months').endOf('month').toDate();

  const cpfCertificationResultCount = await cpfCertificationResultRepository.countByTimeRange({ startDate, endDate });
  const cpfCertificationResultChunksCount = Math.ceil(cpfCertificationResultCount / plannerJob.chunkSize);

  logger.info(
    `Start from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}, plan ${cpfCertificationResultChunksCount} job(s) for ${cpfCertificationResultCount} certifications`
  );

  const newJobs = [];
  for (let index = 0; index < cpfCertificationResultChunksCount; index++) {
    const batchId = `${job.id}#${index}`;
    await cpfCertificationResultRepository.markCertificationToExport({
      startDate,
      endDate,
      limit: plannerJob.chunkSize,
      offset: index * plannerJob.chunkSize,
      batchId,
    });

    newJobs.push(batchId);
    logger.info(`${batchId} created for (${index + 1}/${cpfCertificationResultChunksCount})`);
  }

  await pgBoss.insert(newJobs.map((batchId) => ({ name: 'CpfExportBuilderJob', data: { batchId } })));
};
