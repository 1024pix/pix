const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection.js');
const { NotFoundError } = require('../../domain/errors.js');
const DomainTransaction = require('../DomainTransaction.js');
const TrainingTrigger = require('../../domain/models/TrainingTrigger.js');
const TrainingTriggerTube = require('../../domain/models/TrainingTriggerTube.js');
const areaRepository = require('./area-repository');
const competenceRepository = require('./competence-repository');
const thematicRepository = require('./thematic-repository');
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

    const trainingTriggerTubesToCreate = triggerTubesForCreation.map(({ tubeId, level }) => {
      return {
        trainingTriggerId: trainingTrigger.id,
        tubeId,
        level,
      };
    });

    const createdTrainingTriggerTubes = await knexConn('training-trigger-tubes')
      .insert(trainingTriggerTubesToCreate)
      .returning('*');

    const tubes = await tubeRepository.findByRecordIds(createdTrainingTriggerTubes.map(({ tubeId }) => tubeId));

    return _toDomain({ trainingTrigger, triggerTubes: createdTrainingTriggerTubes, tubes });
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

    return Promise.all(
      trainingTriggers.map(async (trainingTrigger) => {
        const triggerTubes = trainingTriggerTubes.filter(
          ({ trainingTriggerId }) => trainingTriggerId === trainingTrigger.id
        );
        return await _toDomain({ trainingTrigger, triggerTubes, tubes });
      })
    );
  },
};

async function _toDomain({ trainingTrigger, triggerTubes, tubes = [] }) {
  const tubeIds = tubes.map(({ id }) => id);
  const notFoundTubeIds = triggerTubes.filter(({ tubeId }) => {
    return !tubeIds.includes(tubeId);
  });

  if (notFoundTubeIds.length > 0) {
    throw new NotFoundError(
      `Les sujets [${notFoundTubeIds.join(', ')}] du déclencheur ${
        trainingTrigger.id
      } n'existent pas dans le référentiel.`
    );
  }

  const learningContent = await _getLearningContent(tubes);

  return new TrainingTrigger({
    id: trainingTrigger.id,
    trainingId: trainingTrigger.trainingId,
    type: trainingTrigger.type,
    threshold: trainingTrigger.threshold,
    triggerTubes: triggerTubes.map(
      ({ id, tubeId, level }) => new TrainingTriggerTube({ id, tube: tubes.find(({ id }) => id === tubeId), level })
    ),
    areas: learningContent.areas,
    competences: learningContent.competences,
    thematics: learningContent.thematics,
  });
}

async function _getLearningContent(tubes, locale = 'fr-fr') {
  const thematicIds = _.keys(_.groupBy(tubes, 'thematicId'));
  const thematics = await thematicRepository.findByRecordIds(thematicIds, locale);

  const competenceIds = _.keys(_.groupBy(thematics, 'competenceId'));
  const competences = await competenceRepository.findByRecordIds({ competenceIds, locale });

  const areaIds = _.keys(_.groupBy(competences, 'areaId'));
  const areas = await areaRepository.findByRecordIds({ areaIds, locale });

  return {
    areas,
    competences,
    thematics,
  };
}
