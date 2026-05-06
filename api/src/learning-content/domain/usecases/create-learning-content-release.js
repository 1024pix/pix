import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

/** @param {import('./dependencies.js').Dependencies} */
export async function createLearningContentRelease({
  lcmsClient,
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
  moduleRepository,
}) {
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
    await moduleRepository.saveMany(newLearningContent.modules);
  });

  areaRepository.clearCache();
  competenceRepository.clearCache();
  thematicRepository.clearCache();
  tubeRepository.clearCache();
  skillRepository.clearCache();
  challengeRepository.clearCache();
  courseRepository.clearCache();
  tutorialRepository.clearCache();
  missionRepository.clearCache();
  moduleRepository.clearCache();
}
