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
export async function refreshLearningContentCache({
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
  const learningContent = await lcmsClient.getRelease();

  await DomainTransaction.execute(async () => {
    await frameworkRepository.saveMany(learningContent.frameworks);
    await areaRepository.saveMany(learningContent.areas);
    await competenceRepository.saveMany(learningContent.competences);
    await thematicRepository.saveMany(learningContent.thematics);
    await tubeRepository.saveMany(learningContent.tubes);
    await skillRepository.saveMany(learningContent.skills);
    await challengeRepository.saveMany(learningContent.challenges);
    await courseRepository.saveMany(learningContent.courses);
    await tutorialRepository.saveMany(learningContent.tutorials);
    await missionRepository.saveMany(learningContent.missions);
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
