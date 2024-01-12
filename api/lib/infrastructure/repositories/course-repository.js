import { Course } from '../../domain/models/Course.js';
import { courseDatasource } from '../datasources/learning-content/course-datasource.js';
import { LearningContentResourceNotFound } from '../../../src/shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { NotFoundError } from '../../domain/errors.js';

function _toDomain(courseDataObject) {
  return new Course({
    id: courseDataObject.id,
    name: courseDataObject.name,
    description: courseDataObject.description,
    isActive: courseDataObject.isActive,
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

const get = async function (id) {
  return _get(id);
};

const getCourseName = async function (id) {
  try {
    const course = await _get(id);
    return course.name;
  } catch (err) {
    throw new NotFoundError("Le test demandé n'existe pas");
  }
};

export { get, getCourseName };
