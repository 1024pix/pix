import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

/** @param {import('./dependencies.js').Dependencies} */
export async function refreshLearningContentCache({
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
}) {
  const learningContent = await lcmsClient.getLatestRelease();

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
