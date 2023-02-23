const { knex } = require('../../../db/knex-database-connection.js');
const TutorialEvaluation = require('../../domain/models/TutorialEvaluation.js');

const TABLE_NAME = 'tutorial-evaluations';

module.exports = {
  async createOrUpdate({ userId, tutorialId, status }) {
    const tutorialEvaluation = await knex(TABLE_NAME)
      .insert({
        userId,
        tutorialId,
        status,
      })
      .onConflict(['userId', 'tutorialId'])
      .merge({
        status,
        updatedAt: knex.fn.now(),
      })
      .returning('*');
    return _toDomain(tutorialEvaluation[0]);
  },

  async find({ userId }) {
    const tutorialEvaluation = await knex(TABLE_NAME).where({ userId });
    return tutorialEvaluation.map(_toDomain);
  },
};

function _toDomain(tutorialEvaluationData) {
  return new TutorialEvaluation({
    id: tutorialEvaluationData.id,
    userId: tutorialEvaluationData.userId,
    tutorialId: tutorialEvaluationData.tutorialId,
    status: tutorialEvaluationData.status,
    updatedAt: tutorialEvaluationData.updatedAt,
  });
}
