import { areaRepository as injectedAreaRepository } from '../../infrastructure/repositories/area-repository.js';
import { challengeRepository as injectedChallengeRepository } from '../../infrastructure/repositories/challenge-repository.js';
import { competenceRepository as injectedCompetenceRepository } from '../../infrastructure/repositories/competence-repository.js';
import { courseRepository as injectedCourseRepository } from '../../infrastructure/repositories/course-repository.js';
import { frameworkRepository as injectedFrameworkRepository } from '../../infrastructure/repositories/framework-repository.js';
import { missionRepository as injectedMissionRepository } from '../../infrastructure/repositories/mission-repository.js';
import { skillRepository as injectedSkillRepository } from '../../infrastructure/repositories/skill-repository.js';
import { thematicRepository as injectedThematicRepository } from '../../infrastructure/repositories/thematic-repository.js';
import { tubeRepository as injectedTubeRepository } from '../../infrastructure/repositories/tube-repository.js';
import { tutorialRepository as injectedTutorialRepository } from '../../infrastructure/repositories/tutorial-repository.js';

/** @param {import('./dependencies.js').Dependencies} */
export async function patchLearningContentCacheEntry({
  recordId,
  updatedRecord,
  modelName,
  frameworkRepository = injectedFrameworkRepository,
  areaRepository = injectedAreaRepository,
  competenceRepository = injectedCompetenceRepository,
  thematicRepository = injectedThematicRepository,
  tubeRepository = injectedTubeRepository,
  skillRepository = injectedSkillRepository,
  challengeRepository = injectedChallengeRepository,
  courseRepository = injectedCourseRepository,
  tutorialRepository = injectedTutorialRepository,
  missionRepository = injectedMissionRepository,
} = {}) {
  const repository = {
    frameworks: frameworkRepository,
    areas: areaRepository,
    competences: competenceRepository,
    thematics: thematicRepository,
    tubes: tubeRepository,
    skills: skillRepository,
    challenges: challengeRepository,
    courses: courseRepository,
    tutorials: tutorialRepository,
    missions: missionRepository,
  }[modelName];

  await repository.save(updatedRecord);
  repository.clearCache(recordId);
}
