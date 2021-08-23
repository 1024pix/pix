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
  const publishedCertificationResults = certificationResults.filter((certificationResults) => certificationResults.isPublished);

  if (isEmpty(publishedCertificationResults)) {
    throw new NoCertificationResultForDivision();
  }

  return publishedCertificationResults;
};
