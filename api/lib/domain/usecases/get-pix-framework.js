module.exports = async function getTubes({ locale, tubeRepository, thematicRepository, areaRepository }) {
  const tubes = await tubeRepository.findActivesFromPixFramework(locale);
  const thematics = await thematicRepository.list();
  const areas = await areaRepository.listWithPixCompetencesOnly();

  return { tubes, thematics, areas };
};
