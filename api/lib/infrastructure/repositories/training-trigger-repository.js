const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection.js');
const { NotFoundError } = require('../../domain/errors.js');
const DomainTransaction = require('../DomainTransaction.js');
const TrainingTriggerForAdmin = require('../../domain/read-models/TrainingTriggerForAdmin.js');
const TrainingTriggerTube = require('../../domain/models/TrainingTriggerTube.js');
const areaRepository = require('./area-repository');
const competenceRepository = require('./competence-repository');
const thematicRepository = require('./thematic-repository');
const tubeRepository = require('./tube-repository');
const TrainingTrigger = require('../../domain/models/TrainingTrigger');
const logger = require('../logger');
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

    return _toDomainForAdmin({ trainingTrigger, triggerTubes: createdTrainingTriggerTubes });
  },

  async findByTrainingIdForAdmin({ trainingId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction?.knexTransaction || knex;
    const trainingTriggers = await knexConn(TABLE_NAME).select('*').where({ trainingId }).orderBy('id', 'asc');
    if (!trainingTriggers) {
      return [];
    }
    const trainingTriggerIds = trainingTriggers.map(({ id }) => id);
    const trainingTriggerTubes = await knexConn('training-trigger-tubes')
      .whereIn('trainingTriggerId', trainingTriggerIds)
      .select('*');

    return Promise.all(
      trainingTriggers.map(async (trainingTrigger) => {
        const triggerTubes = trainingTriggerTubes.filter(
          ({ trainingTriggerId }) => trainingTriggerId === trainingTrigger.id
        );
        return await _toDomainForAdmin({ trainingTrigger, triggerTubes });
      })
    );
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

    return Promise.all(
      trainingTriggers.map(async (trainingTrigger) => {
        const triggerTubes = trainingTriggerTubes.filter(
          ({ trainingTriggerId }) => trainingTriggerId === trainingTrigger.id
        );
        return _toDomain({ trainingTrigger, triggerTubes });
      })
    );
  },
};

async function _toDomain({ trainingTrigger, triggerTubes }) {
  const triggerTubeIds = triggerTubes.map(({ tubeId }) => tubeId);

  const tubes = await tubeRepository.findByRecordIds(triggerTubeIds);

  const tubeIds = tubes.map(({ id }) => id);
  const notFoundTubeIds = triggerTubeIds.filter((triggerTubeId) => {
    return !tubeIds.includes(triggerTubeId);
  });

  if (notFoundTubeIds.length > 0) {
    logger.warn({
      event: 'training_trigger_tubes_not_found',
      message: `Les sujets ${notFoundTubeIds.join(', ')} du déclencheur ${
        trainingTrigger.id
      } n'existent pas dans le référentiel.`,
      notFoundTubeIds,
      trainingTriggerId: trainingTrigger.id,
    });
  }

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

async function _toDomainForAdmin({ trainingTrigger, triggerTubes }) {
  const triggerTubeIds = triggerTubes.map(({ tubeId }) => tubeId);

  const tubes = await tubeRepository.findByRecordIds(triggerTubeIds);

  const tubeIds = tubes.map(({ id }) => id);
  const notFoundTubeIds = triggerTubeIds.filter((tubeId) => {
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

  return new TrainingTriggerForAdmin({
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
