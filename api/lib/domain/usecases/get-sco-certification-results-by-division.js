const isEmpty = require('lodash/isEmpty');
const { NoCertificationResultForDivision } = require('../errors.js');

module.exports = async function getScoCertificationResultsByDivision({
  organizationId,
  division,
  scoCertificationCandidateRepository,
  certificationResultRepository,
}) {
  const candidateIds = await scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision({
    organizationId,
    division,
  });
  if (isEmpty(candidateIds)) {
    throw new NoCertificationResultForDivision();
  }

  const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({
    certificationCandidateIds: candidateIds,
  });
  if (isEmpty(certificationResults)) {
    throw new NoCertificationResultForDivision();
  }

  return certificationResults;
};
