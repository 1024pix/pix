const Area = require('../../domain/models/Area');
const areaDatasource = require('../datasources/learning-content/area-datasource');
const competenceRepository = require('./competence-repository');
const _ = require('lodash');

function _toDomain(areaData) {
  return new Area({
    id: areaData.id,
    code: areaData.code,
    name: areaData.name,
    title: areaData.titleFrFr,
    color: areaData.color,
  });
}

async function list() {
  const areaDataObjects = await areaDatasource.list();
  return areaDataObjects.map(_toDomain);
}

async function listWithPixCompetencesOnly({ locale } = {}) {
  const [areas, competences] = await Promise.all([list(), competenceRepository.listPixCompetencesOnly({ locale })]);
  areas.forEach((area) => {
    area.competences = _.filter(competences, { area: { id: area.id } });
  });
  return _.filter(areas, ({ competences }) => !_.isEmpty(competences));
}

async function findByFrameworkId(frameworkId) {
  const areaDatas = await areaDatasource.findByFrameworkId(frameworkId);
  const areas = areaDatas.map(_toDomain);
  const competences = await competenceRepository.list();
  areas.forEach((area) => {
    area.competences = _.filter(competences, { area: { id: area.id } });
  });
  return areas;
}

module.exports = {
  list,
  listWithPixCompetencesOnly,
  findByFrameworkId,
};
