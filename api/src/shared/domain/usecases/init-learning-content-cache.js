const initLearningContentCache = async function ({ LearningContentCache }) {
  await LearningContentCache.instance.get();
};
export { initLearningContentCache };
