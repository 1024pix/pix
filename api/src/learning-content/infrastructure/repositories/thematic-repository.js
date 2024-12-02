import { clearCache } from '../../../../lib/infrastructure/repositories/thematic-repository.js';
import { LearningContentRepository } from './learning-content-repository.js';

class ThematicRepository extends LearningContentRepository {
  constructor() {
    super({ tableName: 'learningcontent.thematics' });
  }

  toDto({ id, name_i18n, index, competenceId, tubeIds }) {
    return {
      id,
      name_i18n,
      index,
      competenceId,
      tubeIds,
    };
  }

  clearCache(id) {
    clearCache(id);
  }
}

export const thematicRepository = new ThematicRepository();
