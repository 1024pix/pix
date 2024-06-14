import { knex } from '../../../db/knex-database-connection.js';

const addNonEnrolledCandidatesToSession = async function ({ sessionId, scoCertificationCandidates }) {
  const organizationLearnerIds = scoCertificationCandidates.map((candidate) => candidate.organizationLearnerId);

  const alreadyEnrolledCandidate = await knex
    .select(['organizationLearnerId'])
    .from('certification-candidates')
    .whereIn('organizationLearnerId', organizationLearnerIds)
    .where({ sessionId });

  const alreadyEnrolledCandidateOrganizationLearnerIds = alreadyEnrolledCandidate.map(
    (candidate) => candidate.organizationLearnerId,
  );

  const scoCandidateToDTO = _scoCandidateToDTOForSession(sessionId);
  const candidatesToBeEnrolledDTOs = scoCertificationCandidates
    .filter((candidate) => !alreadyEnrolledCandidateOrganizationLearnerIds.includes(candidate.organizationLearnerId))
    .map(scoCandidateToDTO);

  await _batchInsertCandidatesAndCoreSubscriptions(candidatesToBeEnrolledDTOs);
};

export { addNonEnrolledCandidatesToSession };

function _scoCandidateToDTOForSession(sessionId) {
  return (scoCandidate) => {
    return {
      firstName: scoCandidate.firstName,
      lastName: scoCandidate.lastName,
      birthdate: scoCandidate.birthdate,
      organizationLearnerId: scoCandidate.organizationLearnerId,
      sex: scoCandidate.sex,
      birthINSEECode: scoCandidate.birthINSEECode,
      birthCity: scoCandidate.birthCity,
      birthCountry: scoCandidate.birthCountry,
      sessionId,
    };
  };
}

async function _batchInsertCandidatesAndCoreSubscriptions(candidatesToBeEnrolledDTOs) {
  await knex
    .batchInsert('certification-candidates', candidatesToBeEnrolledDTOs)
    .returning([knex.raw('id as "certificationCandidateId"'), knex.raw("'CORE' as type")])
    .then(async function (coreSubscriptions) {
      await knex.batchInsert('certification-subscriptions', coreSubscriptions);
    });
}
