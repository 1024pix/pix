import { clearCache } from '../../../../lib/infrastructure/repositories/framework-repository.js';
import { LearningContentRepository } from './learning-content-repository.js';

class FrameworkRepository extends LearningContentRepository {
  constructor() {
    super({ tableName: 'learningcontent.frameworks' });
  }

  toDto({ id, name }) {
    return {
      id,
      name,
    };
  }

  clearCache(id) {
    clearCache(id);
  }
}

export const frameworkRepository = new FrameworkRepository();
