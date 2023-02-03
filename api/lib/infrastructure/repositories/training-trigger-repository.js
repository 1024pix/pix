const { knex } = require('../../../db/knex-database-connection');
const DomainTransaction = require('../DomainTransaction');
const TrainingTrigger = require('../../domain/models/TrainingTrigger');
const TrainingTriggerTube = require('../../domain/models/TrainingTriggerTube');
const TABLE_NAME = 'training-triggers';

module.exports = {
  async createOrUpdate({
    trainingId,
    tubes,
    type,
    threshold,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const knexConn = domainTransaction?.knexTransaction || knex;

    const [trainingTrigger] = await knexConn(TABLE_NAME)
      .insert({ trainingId, type, threshold, updatedAt: new Date() })
      .onConflict(['trainingId', 'type'])
      .merge(['threshold', 'updatedAt'])
      .returning('*');

    await knexConn('training-trigger-tubes').where({ trainingTriggerId: trainingTrigger.id }).delete();

    const trainingTubesToCreate = tubes.map(({ id, level }) => {
      return {
        trainingTriggerId: trainingTrigger.id,
        tubeId: id,
        level,
      };
    });

    const createdTubes = await knexConn('training-trigger-tubes').insert(trainingTubesToCreate).returning('*');

    return _toDomain({ trainingTrigger, tubes: createdTubes });
  },
};

function _toDomain({ trainingTrigger, tubes = [] }) {
  return new TrainingTrigger({
    id: trainingTrigger.id,
    trainingId: trainingTrigger.trainingId,
    type: trainingTrigger.type,
    threshold: trainingTrigger.threshold,
    tubes: tubes.map(({ tubeId, level }) => new TrainingTriggerTube({ id: tubeId, level })),
  });
}
