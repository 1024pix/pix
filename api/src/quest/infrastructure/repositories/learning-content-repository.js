export const findByTubeIds = async ({ tubeIds, learningContentApi }) => {
  return learningContentApi.findByTubeIds({ tubeIds, locale: 'fr-fr' });
};
