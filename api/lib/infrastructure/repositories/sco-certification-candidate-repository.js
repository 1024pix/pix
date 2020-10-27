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

