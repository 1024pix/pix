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
}

export const tubeRepository = new TubeRepository();
