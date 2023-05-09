import { knex } from '../../../db/knex-database-connection.js';
import { TutorialEvaluation } from '../../domain/models/TutorialEvaluation.js';

const TABLE_NAME = 'tutorial-evaluations';

const createOrUpdate = async function ({ userId, tutorialId, status }) {
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
};

const find = async function ({ userId }) {
  const tutorialEvaluation = await knex(TABLE_NAME).where({ userId });
  return tutorialEvaluation.map(_toDomain);
};

export { createOrUpdate, find };

function _toDomain(tutorialEvaluationData) {
  return new TutorialEvaluation({
    id: tutorialEvaluationData.id,
    userId: tutorialEvaluationData.userId,
    tutorialId: tutorialEvaluationData.tutorialId,
    status: tutorialEvaluationData.status,
    updatedAt: tutorialEvaluationData.updatedAt,
  });
}
