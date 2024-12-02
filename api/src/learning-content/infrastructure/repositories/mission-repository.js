import { clearCache } from '../../../school/infrastructure/repositories/mission-repository.js';
import { LearningContentRepository } from './learning-content-repository.js';

class MissionRepository extends LearningContentRepository {
  constructor() {
    super({ tableName: 'learningcontent.missions' });
  }

  toDto({
    id,
    status,
    name_i18n,
    content,
    learningObjectives_i18n,
    validatedObjectives_i18n,
    introductionMediaType,
    introductionMediaUrl,
    introductionMediaAlt_i18n,
    documentationUrl,
    cardImageUrl,
    competenceId,
  }) {
    return {
      id,
      status,
      name_i18n,
      content,
      learningObjectives_i18n,
      validatedObjectives_i18n,
      introductionMediaType,
      introductionMediaUrl,
      introductionMediaAlt_i18n,
      documentationUrl,
      cardImageUrl,
      competenceId,
    };
  }

  clearCache(id) {
    clearCache(id);
  }
}

export const missionRepository = new MissionRepository();
