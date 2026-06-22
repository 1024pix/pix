/** @param {import('./dependencies.js').Dependencies} */
export async function patchLearningContentEntry({
  recordId,
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
  moduleRepository,
}) {
  const repository = {
    frameworks: frameworkRepository,
    areas: areaRepository,
    competences: competenceRepository,
    thematics: thematicRepository,
    tubes: tubeRepository,
    skills: skillRepository,
    challenges: challengeRepository,
    courses: courseRepository,
    tutorials: tutorialRepository,
    missions: missionRepository,
    modules: moduleRepository,
  }[modelName];

  await repository.save(updatedRecord);
  repository.clearCache?.(recordId);
}
