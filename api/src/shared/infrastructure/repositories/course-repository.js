import { Course } from '../../../evaluation/domain/models/Course.js';
import { NotFoundError } from '../../domain/errors.js';
import { LearningContentRedisRepository } from './learning-content-redis-repository.js';
import { LearningContentRepository } from './learning-content-repository.js';

const TABLE_NAME = 'learningcontent.courses';

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

/** @type {LearningContentRedisRepository} */
let redisInstance;

/** @type {LearningContentRepository} */
let instance;

function getInstance() {
  if (LearningContentRedisRepository.isEnabled) {
    if (!redisInstance) {
      redisInstance = new LearningContentRedisRepository({ tableName: TABLE_NAME });
    }
    return redisInstance;
  }
  if (!instance) {
    instance = new LearningContentRepository({ tableName: TABLE_NAME });
  }
  return instance;
}
