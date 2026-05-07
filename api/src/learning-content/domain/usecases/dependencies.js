import { lcmsClient } from '../../../shared/infrastructure/lcms-client.js';
import * as sharedAreaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as sharedFrameworkRepository from '../../../shared/infrastructure/repositories/framework-repository.js';
import * as sharedSkillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import * as sharedThematicRepository from '../../../shared/infrastructure/repositories/thematic-repository.js';
import * as sharedTubeRepository from '../../../shared/infrastructure/repositories/tube-repository.js';
import { areaRepository } from '../../infrastructure/repositories/area-repository.js';
import { challengeRepository } from '../../infrastructure/repositories/challenge-repository.js';
import { competenceRepository } from '../../infrastructure/repositories/competence-repository.js';
import { courseRepository } from '../../infrastructure/repositories/course-repository.js';
import { frameworkRepository } from '../../infrastructure/repositories/framework-repository.js';
import { createLearningContentReleaseJobRepository } from '../../infrastructure/repositories/jobs/create-learning-content-release-job-repository.js';
import { refreshLearningContentJobRepository } from '../../infrastructure/repositories/jobs/refresh-learning-content-job-repository.js';
import { missionRepository } from '../../infrastructure/repositories/mission-repository.js';
import { moduleRepository } from '../../infrastructure/repositories/module-repository.js';
import { skillRepository } from '../../infrastructure/repositories/skill-repository.js';
import { thematicRepository } from '../../infrastructure/repositories/thematic-repository.js';
import { tubeRepository } from '../../infrastructure/repositories/tube-repository.js';
import { tutorialRepository } from '../../infrastructure/repositories/tutorial-repository.js';

export const dependencies = {
  areaRepository,
  challengeRepository,
  competenceRepository,
  courseRepository,
  frameworkRepository,
  lcmsClient,
  createLearningContentReleaseJobRepository,
  refreshLearningContentJobRepository,
  missionRepository,
  moduleRepository,
  sharedAreaRepository,
  sharedFrameworkRepository,
  sharedSkillRepository,
  sharedThematicRepository,
  sharedTubeRepository,
  skillRepository,
  thematicRepository,
  tubeRepository,
  tutorialRepository,
};

/** @typedef {typeof dependencies} Dependencies */
