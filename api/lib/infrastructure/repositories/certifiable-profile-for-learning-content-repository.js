import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection';
import CertifiableProfileForLearningContent from '../../domain/models/CertifiableProfileForLearningContent';
import knowledgeElementRepository from './knowledge-element-repository';

export default {
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
