import { clearCache } from '../../../../lib/infrastructure/repositories/tube-repository.js';
import { LearningContentRepository } from './learning-content-repository.js';

class TubeRepository extends LearningContentRepository {
  constructor() {
    super({ tableName: 'learningcontent.tubes' });
  }

  toDto({
    id,
    name,
    title,
    description,
    practicalTitle_i18n,
    practicalDescription_i18n,
    competenceId,
    thematicId,
    skillIds,
    isMobileCompliant,
    isTabletCompliant,
  }) {
    return {
      id,
      name,
      title,
      description,
      practicalTitle_i18n,
      practicalDescription_i18n,
      competenceId,
      thematicId,
      skillIds,
      isMobileCompliant,
      isTabletCompliant,
    };
  }

  clearCache(id) {
    clearCache(id);
  }
}

export const tubeRepository = new TubeRepository();
