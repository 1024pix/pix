import { clearCache } from '../../../shared/infrastructure/repositories/area-repository.js';
import { LearningContentRepository } from './learning-content-repository.js';

class AreaRepository extends LearningContentRepository {
  constructor() {
    super({ tableName: 'learningcontent.areas' });
  }

  toDto({ id, code, name, title_i18n, color, frameworkId, competenceIds }) {
    return {
      id,
      code,
      name,
      title_i18n,
      color,
      frameworkId,
      competenceIds,
    };
  }

  clearCache(id) {
    clearCache(id);
  }
}

export const areaRepository = new AreaRepository();
