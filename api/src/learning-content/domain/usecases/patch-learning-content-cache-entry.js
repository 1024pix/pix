/** @param {import('./dependencies.js').Dependencies} */
export async function patchLearningContentCacheEntry({
  recordId,
  updatedRecord,
  modelName,
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
  const currentLearningContent = await LearningContentCache.instance.get();
  const patch = generatePatch(currentLearningContent, recordId, updatedRecord, modelName);
  await LearningContentCache.instance.patch(patch);
  await patchDatabase(
    modelName,
    updatedRecord,
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
  );
}

function generatePatch(currentLearningContent, id, newEntry, modelName) {
  const index = currentLearningContent[modelName].findIndex((element) => element?.id === id);
  if (index === -1) {
    return {
      operation: 'push',
      path: modelName,
      value: newEntry,
    };
  }
  return {
    operation: 'assign',
    path: `${modelName}[${index}]`,
    value: newEntry,
  };
}

async function patchDatabase(
  modelName,
  patchedRecord,
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
) {
  if (modelName === 'frameworks') {
    await frameworkRepository.save(patchedRecord);
  }
  if (modelName === 'areas') {
    await areaRepository.save(patchedRecord);
  }
  if (modelName === 'competences') {
    await competenceRepository.save(patchedRecord);
  }
  if (modelName === 'thematics') {
    await thematicRepository.save(patchedRecord);
  }
  if (modelName === 'tubes') {
    await tubeRepository.save(patchedRecord);
  }
  if (modelName === 'skills') {
    await skillRepository.save(patchedRecord);
  }
  if (modelName === 'challenges') {
    await challengeRepository.save(patchedRecord);
  }
  if (modelName === 'courses') {
    await courseRepository.save(patchedRecord);
  }
  if (modelName === 'tutorials') {
    await tutorialRepository.save(patchedRecord);
  }
  if (modelName === 'missions') {
    await missionRepository.save(patchedRecord);
  }
}
