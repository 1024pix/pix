const dayjs = require('dayjs');
const { plannerJob } = require('../../../../config').cpf;
const times = require('lodash/times');

module.exports = async function planner({ pgBoss, cpfCertificationResultRepository }) {
  const startDate = dayjs()
    .utc()
    .subtract(plannerJob.minimumReliabilityPeriod + (plannerJob.monthsToProcess - 1), 'months')
    .startOf('month')
    .toDate();
  const endDate = dayjs().utc().subtract(plannerJob.minimumReliabilityPeriod, 'months').endOf('month').toDate();

  const certificationsCount = await cpfCertificationResultRepository.countByTimeRange({ startDate, endDate });
  const jobCount = Math.ceil(certificationsCount / plannerJob.chunkSize);

  times(jobCount, (index) => {
    pgBoss.send('CpfExportBuilderJob', {
      startDate,
      endDate,
      limit: plannerJob.chunkSize,
      offset: index * plannerJob.chunkSize,
    });
  });
};
