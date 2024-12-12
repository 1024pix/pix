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
}

export const frameworkRepository = new FrameworkRepository();
