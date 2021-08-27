const isEmpty = require('lodash/isEmpty');
const { NoCertificationResultForDivision } = require('../errors');

module.exports = async function getScoCertificationResultsByDivision({
  organizationId,
  division,
  scoCertificationCandidateRepository,
  certificationResultRepository,
}) {
  const candidateIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({ organizationId, division });
  const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({ certificationCandidateIds: candidateIds });

  if (isEmpty(certificationResults)) {
    throw new NoCertificationResultForDivision();
  }

  return certificationResults;
};
