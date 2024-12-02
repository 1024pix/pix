import { clearCache } from '../../../shared/infrastructure/repositories/course-repository.js';
import { LearningContentRepository } from './learning-content-repository.js';

class CourseRepository extends LearningContentRepository {
  constructor() {
    super({ tableName: 'learningcontent.courses' });
  }

  toDto({ id, name, description, isActive, competences, challenges }) {
    return {
      id,
      name,
      description,
      isActive,
      competences,
      challenges,
    };
  }

  clearCache(id) {
    clearCache(id);
  }
}

export const courseRepository = new CourseRepository();
