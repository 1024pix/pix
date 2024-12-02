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
    await frameworkRepository.saveMany([patchedRecord]);
  }
  if (modelName === 'areas') {
    await areaRepository.saveMany([patchedRecord]);
  }
  if (modelName === 'competences') {
    await competenceRepository.saveMany([patchedRecord]);
  }
  if (modelName === 'thematics') {
    await thematicRepository.saveMany([patchedRecord]);
  }
  if (modelName === 'tubes') {
    await tubeRepository.saveMany([patchedRecord]);
  }
  if (modelName === 'skills') {
    await skillRepository.saveMany([patchedRecord]);
  }
  if (modelName === 'challenges') {
    await challengeRepository.saveMany([patchedRecord]);
  }
  if (modelName === 'courses') {
    await courseRepository.saveMany([patchedRecord]);
  }
  if (modelName === 'tutorials') {
    await tutorialRepository.saveMany([patchedRecord]);
  }
  if (modelName === 'missions') {
    await missionRepository.saveMany([patchedRecord]);
  }
}
