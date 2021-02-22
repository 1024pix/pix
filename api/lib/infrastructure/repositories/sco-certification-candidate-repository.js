const { knex } = require('../bookshelf');
const _ = require('lodash');

module.exports = {

  async addNonEnrolledCandidatesToSession({ sessionId, scoCertificationCandidates }) {
    const schoolingRegistrationIds = scoCertificationCandidates.map((candidate) => candidate.schoolingRegistrationId);

    const alreadyEnrolledCandidate = await knex
      .select(['schoolingRegistrationId'])
      .from('certification-candidates')
      .whereIn('schoolingRegistrationId', schoolingRegistrationIds)
      .where({ sessionId });

    const alreadyEnrolledCandidateSchoolingRegistrationIds = alreadyEnrolledCandidate
      .map((candidate) => candidate.schoolingRegistrationId);

    const scoCandidateToDTO = _scoCandidateToDTOForSession(sessionId);
    const candidatesToBeEnrolledDTOs = scoCertificationCandidates
      .filter((candidate) => !alreadyEnrolledCandidateSchoolingRegistrationIds.includes(candidate.schoolingRegistrationId))
      .map(scoCandidateToDTO);

    await knex.batchInsert('certification-candidates', candidatesToBeEnrolledDTOs);
  },

  async findIdsByOrganizationIdAndDivision({ organizationId, division }) {
    const rows = await knex
      .select(['certification-candidates.id'])
      .from('certification-candidates')
      .join('schooling-registrations', 'schooling-registrations.id', 'certification-candidates.schoolingRegistrationId')
      .where('schooling-registrations.organizationId', '=', organizationId)
      .whereRaw('LOWER("schooling-registrations"."division") LIKE ?', `${division.toLowerCase()}`)
      .orderBy('certification-candidates.lastName', 'ASC')
      .orderBy('certification-candidates.firstName', 'ASC');

    return rows.map((row) => row.id);
  },
};

function _scoCandidateToDTOForSession(sessionId) {
  return (scoCandidate) => {
    const dto = _.omit(scoCandidate, 'id');
    return {
      ...dto,
      sessionId,
      birthCity: '',
    };
  };
}

