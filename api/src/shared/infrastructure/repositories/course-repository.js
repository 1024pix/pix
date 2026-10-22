import { Course } from '../../../evaluation/domain/models/Course.js';
import { NotFoundError } from '../../domain/errors.js';
import { makeGetInstance } from './learning-content-repository.ts';

const TABLE_NAME = 'learningcontent.courses';

const getInstance = makeGetInstance({ tableName: TABLE_NAME });

export async function get(id) {
  const courseDto = await getInstance().load(id);
  if (!courseDto) {
    throw new NotFoundError();
  }
  return toDomain(courseDto);
}

export function clearCache(id) {
  return getInstance().clearCache?.(id);
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
