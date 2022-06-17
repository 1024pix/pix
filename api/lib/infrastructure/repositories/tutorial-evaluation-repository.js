const { knex } = require('../../../db/knex-database-connection');
const TutorialEvaluation = require('../../domain/models/TutorialEvaluation');

module.exports = {
  async addEvaluation({ userId, tutorialId, status }) {
    const foundTutorialEvaluation = await knex('tutorial-evaluations').where({ userId, tutorialId, status }).first();

    if (foundTutorialEvaluation) {
      return _toDomain(foundTutorialEvaluation);
    }

    const [newTutorialEvaluation] = await knex('tutorial-evaluations')
      .insert({ userId, tutorialId, status })
      .returning('*');
    return _toDomain(newTutorialEvaluation);
  },

  async find({ userId }) {
    const tutorialEvaluation = await knex('tutorial-evaluations').where({ userId });
    return tutorialEvaluation.map(_toDomain);
  },
};

function _toDomain(tutorialEvaluationData) {
  return new TutorialEvaluation({
    id: tutorialEvaluationData.id,
    userId: tutorialEvaluationData.userId,
    tutorialId: tutorialEvaluationData.tutorialId,
    status: tutorialEvaluationData.status,
  });
}
