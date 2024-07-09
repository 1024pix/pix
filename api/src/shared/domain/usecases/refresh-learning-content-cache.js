const refreshLearningContentCache = async function ({ lcmsRefreshCacheJob }) {
  await lcmsRefreshCacheJob.schedule();
};
export { refreshLearningContentCache };
