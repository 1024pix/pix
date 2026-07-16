import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { ModuleVersion } from '../models/ModuleVersion.js';

/** @param {import('./dependencies.js').Dependencies} */
export async function refreshLearningContent({
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

    const existingModules = await moduleRepository.list();
    const existingModulesById = new Map(existingModules.map((module) => [module.id, module]));

    const newerModules = learningContent.modules.filter((module) => {
      if (!existingModulesById.has(module.id)) return true;
      const existingModule = existingModulesById.get(module.id);
      return new ModuleVersion({ version: module.version }).isGreaterThan(existingModule.version);
    });

    await moduleRepository.saveMany(newerModules);
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
