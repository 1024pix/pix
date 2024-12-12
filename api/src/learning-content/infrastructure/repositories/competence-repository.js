import { LearningContentRepository } from './learning-content-repository.js';

class CompetenceRepository extends LearningContentRepository {
  constructor() {
    super({ tableName: 'learningcontent.competences' });
  }

  toDto({ id, name_i18n, description_i18n, index, origin, areaId, skillIds, thematicIds }) {
    return {
      id,
      name_i18n,
      description_i18n,
      index,
      origin,
      areaId,
      skillIds,
      thematicIds,
    };
  }
}

export const competenceRepository = new CompetenceRepository();
