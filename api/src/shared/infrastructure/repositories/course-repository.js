import { NotFoundError } from '../../domain/errors.js';
import { Course } from '../../domain/models/Course.js';
import { LearningContentDatasource } from './learning-content-datasource.js';

const TABLE_NAME = 'learningcontent.courses';

export async function get(id) {
  const courseDto = await getInstance().load(id);
  if (!courseDto) {
    throw new NotFoundError();
  }
  return toDomain(courseDto);
}

export async function getCourseName(id) {
  try {
    const course = await get(id);
    return course.name;
  } catch {
    throw new NotFoundError("Le test demandé n'existe pas");
  }
}

export function clearCache(id) {
  return getInstance().clearCache(id);
}

function toDomain(courseDto) {
  return new Course({
    id: courseDto.id,
    name: courseDto.name,
    description: courseDto.description,
    isActive: courseDto.isActive,
    challenges: courseDto.challenges ? [...courseDto.challenges] : null,
    competences: courseDto.competences ? [...courseDto.competences] : null,
  });
}

/** @type {LearningContentDatasource} */
let instance;

function getInstance() {
  if (!instance) {
    instance = new LearningContentDatasource({ tableName: TABLE_NAME });
  }
  return instance;
}
