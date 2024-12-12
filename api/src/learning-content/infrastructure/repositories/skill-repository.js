import { LearningContentRepository } from './learning-content-repository.js';

class SkillRepository extends LearningContentRepository {
  constructor() {
    super({ tableName: 'learningcontent.skills' });
  }

  toDto({
    id,
    name,
    status,
    pixValue,
    version,
    level,
    hintStatus,
    hint_i18n,
    competenceId,
    tubeId,
    tutorialIds,
    learningMoreTutorialIds,
  }) {
    return {
      id,
      name,
      status,
      pixValue,
      version,
      level,
      hintStatus,
      hint_i18n,
      competenceId,
      tubeId,
      tutorialIds,
      learningMoreTutorialIds,
    };
  }
}

export const skillRepository = new SkillRepository();
