import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import * as areaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import * as thematicRepository from '../../../shared/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../../../shared/infrastructure/repositories/tube-repository.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { TrainingTrigger } from '../../domain/models/TrainingTrigger.js';
import { TrainingTriggerTube } from '../../domain/models/TrainingTriggerTube.js';
import { TrainingTriggerForAdmin } from '../../domain/read-models/TrainingTriggerForAdmin.js';

const TABLE_NAME = 'training-triggers';

const deleteTrainingTrigger = async function ({ trainingTriggerId }) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn('training-trigger-tubes').where({ trainingTriggerId }).delete();
  await knexConn(TABLE_NAME).where({ id: trainingTriggerId }).delete();
};

const createOrUpdate = async function ({ trainingId, triggerTubesForCreation, type, threshold }) {
  const knexConn = DomainTransaction.getConnection();

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
};

const findByTrainingIdForAdmin = async function ({ trainingId }) {
  const knexConn = DomainTransaction.getConnection();
  const trainingTriggers = await knexConn(TABLE_NAME).select('*').where({ trainingId }).orderBy('id', 'asc');
  if (!trainingTriggers) {
    return [];
  }
  const trainingTriggerIds = trainingTriggers.map(({ id }) => id);
  const trainingTriggerTubes = await knexConn('training-trigger-tubes')
    .whereIn('trainingTriggerId', trainingTriggerIds)
    .select('*');
  const triggerTubesByTrainingTriggerId = Map.groupBy(
    trainingTriggerTubes,
    ({ trainingTriggerId }) => trainingTriggerId,
  );

  return Promise.all(
    trainingTriggers.map(async (trainingTrigger) => {
      const triggerTubes = triggerTubesByTrainingTriggerId.get(trainingTrigger.id) ?? [];
      return await _toDomainForAdmin({ trainingTrigger, triggerTubes });
    }),
  );
};

const findByTrainingId = async function ({ trainingId }) {
  const knexConn = DomainTransaction.getConnection();
  const trainingTriggers = await knexConn(TABLE_NAME).select('*').where({ trainingId }).orderBy('id', 'asc');
  if (!trainingTriggers) {
    return [];
  }
  const trainingTriggerIds = trainingTriggers.map(({ id }) => id);
  const trainingTriggerTubes = await knexConn('training-trigger-tubes')
    .whereIn('trainingTriggerId', trainingTriggerIds)
    .select('*')
    .orderBy('tubeId', 'asc');
  const triggerTubesByTrainingTriggerId = Map.groupBy(
    trainingTriggerTubes,
    ({ trainingTriggerId }) => trainingTriggerId,
  );

  return Promise.all(
    trainingTriggers.map(async (trainingTrigger) => {
      const triggerTubes = triggerTubesByTrainingTriggerId.get(trainingTrigger.id) ?? [];
      return _toDomain({ trainingTrigger, triggerTubes });
    }),
  );
};

export { createOrUpdate, deleteTrainingTrigger, findByTrainingId, findByTrainingIdForAdmin };

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

  const availableTriggerTubes = triggerTubes.filter(({ tubeId }) => {
    return tubeIds.includes(tubeId);
  });
  const tubesById = new Map(tubes.map((tube) => [tube.id, tube]));

  return new TrainingTrigger({
    id: trainingTrigger.id,
    trainingId: trainingTrigger.trainingId,
    type: trainingTrigger.type,
    threshold: trainingTrigger.threshold,
    triggerTubes: availableTriggerTubes.map(
      ({ id, tubeId, level }) => new TrainingTriggerTube({ id, tube: tubesById.get(tubeId), level }),
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
      } n'existent pas dans le référentiel.`,
    );
  }

  const learningContent = await _getLearningContent(tubes);
  const tubesById = new Map(tubes.map((tube) => [tube.id, tube]));

  return new TrainingTriggerForAdmin({
    id: trainingTrigger.id,
    trainingId: trainingTrigger.trainingId,
    type: trainingTrigger.type,
    threshold: trainingTrigger.threshold,
    triggerTubes: triggerTubes.map(
      ({ id, tubeId, level }) => new TrainingTriggerTube({ id, tube: tubesById.get(tubeId), level }),
    ),
    areas: learningContent.areas,
    competences: learningContent.competences,
    thematics: learningContent.thematics,
  });
}

async function _getLearningContent(tubes, locale = 'fr-fr') {
  const thematicIds = [...new Set(tubes.map((t) => t.thematicId))];
  const thematics = await thematicRepository.findByRecordIds(thematicIds, locale);

  const competenceIds = [...new Set(thematics.map((t) => t.competenceId))];
  const competences = await competenceRepository.findByRecordIds({ competenceIds, locale });

  const areaIds = [...new Set(competences.map((c) => c.areaId))];
  const areas = await areaRepository.findByRecordIds({ areaIds, locale });

  return {
    areas,
    competences,
    thematics,
  };
}
