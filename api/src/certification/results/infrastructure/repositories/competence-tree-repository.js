import { CompetenceTree } from '../../../../shared/domain/models/CompetenceTree.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';

export async function get({ locale, dependencies = { areaRepository } } = {}) {
  const areas = await dependencies.areaRepository.listWithPixCompetencesOnly({ locale });
  return new CompetenceTree({ areas });
}
