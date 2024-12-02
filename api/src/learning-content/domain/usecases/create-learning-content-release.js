import { withTransaction } from '../../../shared/domain/DomainTransaction.js';

export const createLearningContentRelease = withTransaction(
  /** @param {import('./dependencies.js').Dependencies} */
  async function createLearningContentRelease({
    LearningContentCache,
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
    const learningContent = await LearningContentCache.instance.update();

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
  },
);
