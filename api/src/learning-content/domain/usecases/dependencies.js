import { LearningContentCache } from '../../../shared/infrastructure/caches/learning-content-cache.js';
import { areaRepository } from '../../infrastructure/repositories/area-repository.js';
import { challengeRepository } from '../../infrastructure/repositories/challenge-repository.js';
import { competenceRepository } from '../../infrastructure/repositories/competence-repository.js';
import { courseRepository } from '../../infrastructure/repositories/course-repository.js';
import { frameworkRepository } from '../../infrastructure/repositories/framework-repository.js';
import { lcmsCreateReleaseJobRepository } from '../../infrastructure/repositories/jobs/lcms-create-release-job-repository.js';
import { lcmsRefreshCacheJobRepository } from '../../infrastructure/repositories/jobs/lcms-refresh-cache-job-repository.js';
import { missionRepository } from '../../infrastructure/repositories/mission-repository.js';
import { skillRepository } from '../../infrastructure/repositories/skill-repository.js';
import { thematicRepository } from '../../infrastructure/repositories/thematic-repository.js';
import { tubeRepository } from '../../infrastructure/repositories/tube-repository.js';
import { tutorialRepository } from '../../infrastructure/repositories/tutorial-repository.js';

export const dependencies = {
  frameworkRepository,
  areaRepository,
  competenceRepository,
  thematicRepository,
  tubeRepository,
  skillRepository,
  challengeRepository,
  courseRepository,
  tutorialRepository,
  missionRepository,
  lcmsRefreshCacheJobRepository,
  lcmsCreateReleaseJobRepository,
  LearningContentCache,
};

/** @typedef {typeof dependencies} Dependencies */
