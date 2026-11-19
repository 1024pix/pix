import { NoCertificationResultForDivision } from '../errors.js';

export async function getCertificationResultsForDivision({
  organizationId,
  division,
  organizationLearnerAdapter,
  certificationResultForCsvRepository,
}) {
  const learners = await organizationLearnerAdapter.findInOrganizationByDivision({
    organizationId,
    division,
  });
  if (learners.length === 0) {
    throw new NoCertificationResultForDivision();
  }

  const certificationResults = await certificationResultForCsvRepository.findMostRecentByLearners({
    learnerIds: learners.map((learner) => learner.id),
  });

  if (certificationResults.length === 0) {
    throw new NoCertificationResultForDivision();
  }

  return certificationResults;
}
