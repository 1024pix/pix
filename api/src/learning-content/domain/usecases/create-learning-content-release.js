import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
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
export async function createLearningContentRelease({
  lcmsClient,
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
  const newLearningContent = await lcmsClient.createRelease();

  await DomainTransaction.execute(async () => {
    await frameworkRepository.saveMany(newLearningContent.frameworks);
    await areaRepository.saveMany(newLearningContent.areas);
    await competenceRepository.saveMany(newLearningContent.competences);
    await thematicRepository.saveMany(newLearningContent.thematics);
    await tubeRepository.saveMany(newLearningContent.tubes);
    await skillRepository.saveMany(newLearningContent.skills);
    await challengeRepository.saveMany(newLearningContent.challenges);
    await courseRepository.saveMany(newLearningContent.courses);
    await tutorialRepository.saveMany(newLearningContent.tutorials);
    await missionRepository.saveMany(newLearningContent.missions);
  });

  frameworkRepository.clearCache();
  areaRepository.clearCache();
  competenceRepository.clearCache();
  thematicRepository.clearCache();
  tubeRepository.clearCache();
  skillRepository.clearCache();
  challengeRepository.clearCache();
  courseRepository.clearCache();
  tutorialRepository.clearCache();
  missionRepository.clearCache();
}
