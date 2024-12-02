/** @param {import('./dependencies.js').Dependencies} */
export async function patchLearningContentCacheEntry({
  updatedRecord,
  modelName,
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
  if (modelName === 'frameworks') {
    await frameworkRepository.save(updatedRecord);
    frameworkRepository.clearCache(updatedRecord.id);
  }
  if (modelName === 'areas') {
    await areaRepository.save(updatedRecord);
    areaRepository.clearCache(updatedRecord.id);
  }
  if (modelName === 'competences') {
    await competenceRepository.save(updatedRecord);
    competenceRepository.clearCache(updatedRecord.id);
  }
  if (modelName === 'thematics') {
    await thematicRepository.save(updatedRecord);
    thematicRepository.clearCache(updatedRecord.id);
  }
  if (modelName === 'tubes') {
    await tubeRepository.save(updatedRecord);
    tubeRepository.clearCache(updatedRecord.id);
  }
  if (modelName === 'skills') {
    await skillRepository.save(updatedRecord);
    skillRepository.clearCache(updatedRecord.id);
  }
  if (modelName === 'challenges') {
    await challengeRepository.save(updatedRecord);
    challengeRepository.clearCache(updatedRecord.id);
  }
  if (modelName === 'courses') {
    await courseRepository.save(updatedRecord);
    courseRepository.clearCache(updatedRecord.id);
  }
  if (modelName === 'tutorials') {
    await tutorialRepository.save(updatedRecord);
    tutorialRepository.clearCache(updatedRecord.id);
  }
  if (modelName === 'missions') {
    await missionRepository.save(updatedRecord);
    missionRepository.clearCache(updatedRecord.id);
  }
}
