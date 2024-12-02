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
  }
  if (modelName === 'areas') {
    await areaRepository.save(updatedRecord);
  }
  if (modelName === 'competences') {
    await competenceRepository.save(updatedRecord);
  }
  if (modelName === 'thematics') {
    await thematicRepository.save(updatedRecord);
  }
  if (modelName === 'tubes') {
    await tubeRepository.save(updatedRecord);
  }
  if (modelName === 'skills') {
    await skillRepository.save(updatedRecord);
  }
  if (modelName === 'challenges') {
    await challengeRepository.save(updatedRecord);
  }
  if (modelName === 'courses') {
    await courseRepository.save(updatedRecord);
  }
  if (modelName === 'tutorials') {
    await tutorialRepository.save(updatedRecord);
  }
  if (modelName === 'missions') {
    await missionRepository.save(updatedRecord);
  }
}
