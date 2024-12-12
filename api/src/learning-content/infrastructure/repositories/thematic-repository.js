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
}

export const thematicRepository = new ThematicRepository();
