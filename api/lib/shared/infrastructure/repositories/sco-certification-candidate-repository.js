import { knex } from '../../../../db/knex-database-connection.js';

const addNonEnrolledCandidatesToSession = async function ({ sessionId, scoCertificationCandidates }) {
  const organizationLearnerIds = scoCertificationCandidates.map((candidate) => candidate.organizationLearnerId);

  const alreadyEnrolledCandidate = await knex
    .select(['organizationLearnerId'])
    .from('certification-candidates')
    .whereIn('organizationLearnerId', organizationLearnerIds)
    .where({ sessionId });

  const alreadyEnrolledCandidateOrganizationLearnerIds = alreadyEnrolledCandidate.map(
    (candidate) => candidate.organizationLearnerId
  );

  const scoCandidateToDTO = _scoCandidateToDTOForSession(sessionId);
  const candidatesToBeEnrolledDTOs = scoCertificationCandidates
    .filter((candidate) => !alreadyEnrolledCandidateOrganizationLearnerIds.includes(candidate.organizationLearnerId))
    .map(scoCandidateToDTO);

  await knex.batchInsert('certification-candidates', candidatesToBeEnrolledDTOs);
};

const findIdsByOrganizationIdAndDivision = async function ({ organizationId, division }) {
  const rows = await knex
    .select(['certification-candidates.id'])
    .from('certification-candidates')
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'certification-candidates.organizationLearnerId'
    )
    .where({
      'view-active-organization-learners.organizationId': organizationId,
      'view-active-organization-learners.isDisabled': false,
    })
    .whereRaw('LOWER("view-active-organization-learners"."division") = ?', division.toLowerCase())
    .orderBy('certification-candidates.lastName', 'ASC')
    .orderBy('certification-candidates.firstName', 'ASC');

  return rows.map((row) => row.id);
};

export { addNonEnrolledCandidatesToSession, findIdsByOrganizationIdAndDivision };

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
