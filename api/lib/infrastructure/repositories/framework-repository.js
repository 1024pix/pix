async function list() {
  const areaDataObjects = await areaDatasource.list();
  return areaDataObjects.map((areaDataObject) => {
    return new Area({
      id: areaDataObject.id,
      code: areaDataObject.code,
      name: areaDataObject.name,
      title: areaDataObject.titleFrFr,
      color: areaDataObject.color,
    });
  });
}

async function listWithPixCompetencesOnly({ locale } = {}) {
  const [areas, competences] = await Promise.all([list(), competenceRepository.listPixCompetencesOnly({ locale })]);
  areas.forEach((area) => {
    area.competences = _.filter(competences, { area: { id: area.id } });
  });
  return _.filter(areas, ({ competences }) => !_.isEmpty(competences));
}

module.exports = {
  list,
  listWithPixCompetencesOnly,
};
