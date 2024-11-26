/** @param {import('./dependencies.js').Dependencies} */
export async function refreshLearningContentCache({ LearningContentCache }) {
  await LearningContentCache.instance.reset();
}
