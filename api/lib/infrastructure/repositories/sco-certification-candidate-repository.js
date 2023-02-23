const { knex } = require('../../../db/knex-database-connection.js');

module.exports = {
  async addNonEnrolledCandidatesToSession({ sessionId, scoCertificationCandidates }) {
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
  },

  async findIdsByOrganizationIdAndDivision({ organizationId, division }) {
    const rows = await knex
      .select(['certification-candidates.id'])
      .from('certification-candidates')
      .join('organization-learners', 'organization-learners.id', 'certification-candidates.organizationLearnerId')
      .where({
        'organization-learners.organizationId': organizationId,
        'organization-learners.isDisabled': false,
      })
      .whereRaw('LOWER("organization-learners"."division") = ?', division.toLowerCase())
      .orderBy('certification-candidates.lastName', 'ASC')
      .orderBy('certification-candidates.firstName', 'ASC');

    return rows.map((row) => row.id);
  },
};

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
