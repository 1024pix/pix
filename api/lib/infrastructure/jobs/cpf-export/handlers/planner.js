const moment = require('moment');
const { plannerJob } = require('../../../../config').cpf;
const chunk = require('lodash/chunk');

module.exports = async function planner({ pgBoss, cpfCertificationResultRepository }) {
  const startDate = moment()
    .utc()
    .subtract(plannerJob.minimumReliabilityPeriod + (plannerJob.monthsToProcess - 1), 'months')
    .startOf('month')
    .toDate();
  const endDate = moment().utc().subtract(plannerJob.minimumReliabilityPeriod, 'months').endOf('month').toDate();
  const cpfCertificationResults = await cpfCertificationResultRepository.findByTimeRange({ startDate, endDate });

  chunk(cpfCertificationResults, plannerJob.chunkSize).forEach((chunk) => {
    const certificationCourseIds = chunk.map(({ id }) => id);
    pgBoss.send('CpfExportBuilderJob', { certificationCourseIds });
  });
};
