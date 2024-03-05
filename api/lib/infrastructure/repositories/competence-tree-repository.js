import * as areaRepository from '../../../src/shared/infrastructure/repositories/area-repository.js';
import { CompetenceTree } from '../../domain/models/CompetenceTree.js';

const get = async function ({ locale, dependencies = { areaRepository } } = {}) {
  const areas = await dependencies.areaRepository.listWithPixCompetencesOnly({ locale });
  return new CompetenceTree({ areas });
};

export { get };
