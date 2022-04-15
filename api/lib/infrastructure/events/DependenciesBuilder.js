const monitoringTools = require('../monitoring-tools');
const ParticipationResultCalculationJob = require('../jobs/campaign-result/ParticipationResultCalculationJob');

function build(classToInstanciate, domainTransaction) {
  const dependencies = _buildDependencies(domainTransaction);

  return new classToInstanciate(dependencies);
}

function _buildDependencies(domainTransaction) {
  return {
    monitoringTools,
    participationResultCalculationJob: new ParticipationResultCalculationJob(domainTransaction.knexTransaction),
    participantResultsSharedRepository: require('../repositories/participant-results-shared-repository'),
    campaignParticipationRepository: require('../repositories/campaign-participation-repository'),
  };
}

module.exports = {
  build,
};
