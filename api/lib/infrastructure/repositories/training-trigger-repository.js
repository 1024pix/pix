const { knex } = require('../../../db/knex-database-connection.js');
const DomainTransaction = require('../DomainTransaction.js');
const TrainingTrigger = require('../../domain/models/TrainingTrigger.js');
const TrainingTriggerTube = require('../../domain/models/TrainingTriggerTube.js');
const tubeRepository = require('./tube-repository');
const TABLE_NAME = 'training-triggers';

module.exports = {
  async createOrUpdate({
    trainingId,
    triggerTubesForCreation,
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

    const trainingTubesToCreate = triggerTubesForCreation.map(({ id, level }) => {
      return {
        trainingTriggerId: trainingTrigger.id,
        tubeId: id,
        level,
      };
    });

    const createdTriggerTubes = await knexConn('training-trigger-tubes').insert(trainingTubesToCreate).returning('*');

    const tubes = await tubeRepository.findByRecordIds(createdTriggerTubes.map(({ tubeId }) => tubeId));

    return _toDomain({ trainingTrigger, triggerTubes: createdTriggerTubes, tubes });
  },

  async findByTrainingId({ trainingId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction?.knexTransaction || knex;
    const trainingTriggers = await knexConn(TABLE_NAME).select('*').where({ trainingId }).orderBy('id', 'asc');
    if (!trainingTriggers) {
      return [];
    }
    const trainingTriggerIds = trainingTriggers.map(({ id }) => id);
    const trainingTriggerTubes = await knexConn('training-trigger-tubes')
      .whereIn('trainingTriggerId', trainingTriggerIds)
      .select('*');

    const trainingTriggerTubeIds = trainingTriggerTubes.map(({ tubeId }) => tubeId);
    const tubes = await tubeRepository.findByRecordIds(trainingTriggerTubeIds);

    return trainingTriggers.map((trainingTrigger) => {
      const triggerTubes = trainingTriggerTubes.filter(
        ({ trainingTriggerId }) => trainingTriggerId === trainingTrigger.id
      );
      return _toDomain({ trainingTrigger, triggerTubes, tubes });
    });
  },
};

function _toDomain({ trainingTrigger, triggerTubes, tubes = [] }) {
  return new TrainingTrigger({
    id: trainingTrigger.id,
    trainingId: trainingTrigger.trainingId,
    type: trainingTrigger.type,
    threshold: trainingTrigger.threshold,
    triggerTubes: triggerTubes.map(
      ({ id, tubeId, level }) => new TrainingTriggerTube({ id, tube: tubes.find(({ id }) => id === tubeId), level })
    ),
  });
}
