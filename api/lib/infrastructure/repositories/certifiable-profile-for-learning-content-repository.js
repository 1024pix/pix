const _ = require('lodash');
const { knex } = require('../bookshelf');
const CertifiableProfileForLearningContent = require('../../domain/models/CertifiableProfileForLearningContent');
const knowledgeElementRepository = require('./knowledge-element-repository');

module.exports = {

  async get({ id, profileDate, targetProfileWithLearningContent }) {
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: id, limitDate: profileDate });
    const answerIds = _.map(knowledgeElements, 'answerId');
    const answerAndChallengeIds = await knex
      .select(
        'answers.id',
        'answers.challengeId',
      )
      .from('answers')
      .whereIn('id', answerIds);
    const answerAndChallengeIdsByAnswerId = _.keyBy(answerAndChallengeIds, 'id');

    return new CertifiableProfileForLearningContent({
      userId: id,
      profileDate,
      targetProfileWithLearningContent,
      knowledgeElements,
      answerAndChallengeIdsByAnswerId,
    });
  },
};
