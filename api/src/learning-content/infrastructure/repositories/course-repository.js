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
}

export const courseRepository = new CourseRepository();
