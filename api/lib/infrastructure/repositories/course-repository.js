import Course from '../../domain/models/Course';
import courseDatasource from '../datasources/learning-content/course-datasource';
import LearningContentResourceNotFound from '../datasources/learning-content/LearningContentResourceNotFound';
import { NotFoundError } from '../../domain/errors';

function _toDomain(courseDataObject) {
  return new Course({
    id: courseDataObject.id,
    name: courseDataObject.name,
    description: courseDataObject.description,
    imageUrl: courseDataObject.imageUrl,
    challenges: courseDataObject.challenges,
    competences: courseDataObject.competences,
  });
}

async function _get(id) {
  try {
    const courseDataObject = await courseDatasource.get(id);
    return _toDomain(courseDataObject);
  } catch (error) {
    if (error instanceof LearningContentResourceNotFound) {
      throw new NotFoundError();
    }
    throw error;
  }
}

export default {
  async get(id) {
    return _get(id);
  },

  async getCourseName(id) {
    try {
      const course = await _get(id);
      return course.name;
    } catch (err) {
      throw new NotFoundError("Le test demandé n'existe pas");
    }
  },
};
