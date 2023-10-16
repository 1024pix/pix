import { LearningContentResourceNotFound } from '../../../../shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { Module } from '../../../domain/models/Module.js';

const moduleDatasource = {
  getBySlug: async (slug) => {
    const availableModules = await Promise.resolve({
      'les-adresses-mail': new Module({
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        title: 'Les adresses mail',
        list: [],
      }),
    });

    if (availableModules[slug] === undefined) {
      throw new LearningContentResourceNotFound();
    }

    return availableModules[slug];
  },
};

export default moduleDatasource;
