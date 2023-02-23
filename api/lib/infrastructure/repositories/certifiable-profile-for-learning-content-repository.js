const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection.js');
const CertifiableProfileForLearningContent = require('../../domain/models/CertifiableProfileForLearningContent.js');
const knowledgeElementRepository = require('./knowledge-element-repository.js');

module.exports = {
  async get({ id, profileDate, learningContent }) {
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: id, limitDate: profileDate });
    const answerIds = _.map(knowledgeElements, 'answerId');
    const answerAndChallengeIds = await knex
      .select('answers.id', 'answers.challengeId')
      .from('answers')
      .whereIn('id', answerIds);
    const answerAndChallengeIdsByAnswerId = _.keyBy(answerAndChallengeIds, 'id');

    return new CertifiableProfileForLearningContent({
      userId: id,
      profileDate,
      learningContent,
      knowledgeElements,
      answerAndChallengeIdsByAnswerId,
    });
  },
};
