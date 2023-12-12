import _ from 'lodash';
import { knex } from '../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { TrainingTriggerForAdmin } from '../../domain/read-models/TrainingTriggerForAdmin.js';
import { TrainingTriggerTube } from '../../domain/models/TrainingTriggerTube.js';
import * as areaRepository from '../../../../lib/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import * as thematicRepository from '../../../../lib/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../../../../lib/infrastructure/repositories/tube-repository.js';
import { TrainingTrigger } from '../../domain/models/TrainingTrigger.js';
import { logger } from '../../../../lib/infrastructure/logger.js';

const TABLE_NAME = 'training-triggers';

const createOrUpdate = async function ({
  trainingId,
  triggerTubesForCreation,
  type,
  threshold,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction?.knexTransaction || (await knex.transaction());

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

  if (!domainTransaction?.knexTransaction) {
    await knexConn.commit();
  }

  return _toDomainForAdmin({ trainingTrigger, triggerTubes: createdTrainingTriggerTubes });
};

const findByTrainingIdForAdmin = async function ({
  trainingId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
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
        ({ trainingTriggerId }) => trainingTriggerId === trainingTrigger.id,
      );
      return await _toDomainForAdmin({ trainingTrigger, triggerTubes });
    }),
  );
};

const findByTrainingId = async function ({ trainingId, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction?.knexTransaction || knex;
  const trainingTriggers = await knexConn(TABLE_NAME).select('*').where({ trainingId }).orderBy('id', 'asc');
  if (!trainingTriggers) {
    return [];
  }
  const trainingTriggerIds = trainingTriggers.map(({ id }) => id);
  const trainingTriggerTubes = await knexConn('training-trigger-tubes')
    .whereIn('trainingTriggerId', trainingTriggerIds)
    .select('*')
    .orderBy('tubeId', 'asc');

  return Promise.all(
    trainingTriggers.map(async (trainingTrigger) => {
      const triggerTubes = trainingTriggerTubes.filter(
        ({ trainingTriggerId }) => trainingTriggerId === trainingTrigger.id,
      );
      return _toDomain({ trainingTrigger, triggerTubes });
    }),
  );
};

export { createOrUpdate, findByTrainingIdForAdmin, findByTrainingId };

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
      ({ id, tubeId, level }) => new TrainingTriggerTube({ id, tube: tubes.find(({ id }) => id === tubeId), level }),
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

  return new TrainingTriggerForAdmin({
    id: trainingTrigger.id,
    trainingId: trainingTrigger.trainingId,
    type: trainingTrigger.type,
    threshold: trainingTrigger.threshold,
    triggerTubes: triggerTubes.map(
      ({ id, tubeId, level }) => new TrainingTriggerTube({ id, tube: tubes.find(({ id }) => id === tubeId), level }),
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
