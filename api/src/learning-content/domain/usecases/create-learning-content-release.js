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

    await frameworkRepository.save(learningContent.frameworks);
    await areaRepository.save(learningContent.areas);
    await competenceRepository.save(learningContent.competences);
    await thematicRepository.save(learningContent.thematics);
    await tubeRepository.save(learningContent.tubes);
    await skillRepository.save(learningContent.skills);
    await challengeRepository.save(learningContent.challenges);
    await courseRepository.save(learningContent.courses);
    await tutorialRepository.save(learningContent.tutorials);
    await missionRepository.save(learningContent.missions);
  },
);
