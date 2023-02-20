import isEmpty from 'lodash/isEmpty';
import { NoCertificationResultForDivision } from '../errors';

export default async function getScoCertificationResultsByDivision({
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
}
