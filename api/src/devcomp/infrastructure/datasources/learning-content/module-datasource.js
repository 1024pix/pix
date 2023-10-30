import { LearningContentResourceNotFound } from '../../../../shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import referential from './module.json' assert { type: 'json' };

const moduleDatasource = {
  getBySlug: async (slug) => {
    const foundModule = referential.modules.find((module) => module.slug === slug);

    if (foundModule === undefined) {
      throw new LearningContentResourceNotFound();
    }

    return foundModule;
  },
};

export default moduleDatasource;
