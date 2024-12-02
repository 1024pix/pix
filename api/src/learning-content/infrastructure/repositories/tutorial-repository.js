import { clearCache } from '../../../devcomp/infrastructure/repositories/tutorial-repository.js';
import { LearningContentRepository } from './learning-content-repository.js';

class TutorialRepository extends LearningContentRepository {
  constructor() {
    super({ tableName: 'learningcontent.tutorials' });
  }

  toDto({ id, duration, format, title, source, link, locale }) {
    return {
      id,
      duration,
      format,
      title,
      source,
      link,
      locale,
    };
  }

  clearCache(id) {
    clearCache(id);
  }
}

export const tutorialRepository = new TutorialRepository();
