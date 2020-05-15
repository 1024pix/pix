const Area = require('../../domain/models/Area');
const areaDatasource = require('../datasources/airtable/area-datasource');
const competenceRepository = require('./competence-repository');
const _ = require('lodash');

function list() {
  return areaDatasource.list()
    .then((areaDataObjects) => {

      return areaDataObjects.map((areaDataObject) => {
        return new Area({
          id: areaDataObject.id,
          code: areaDataObject.code,
          name: areaDataObject.name,
          title: areaDataObject.titleFrFr,
          color: areaDataObject.color,
        });
      });
    });
}

async function listWithPixCompetencesOnly() {
  const areas = await Promise.all([list(), competenceRepository.listPixCompetencesOnly()])
    .then(([areas, competences]) => {
      areas.forEach((area) => {
        area.competences = _.filter(competences, { area: { id: area.id } });
      });
      return areas;
    });
  return _.filter(areas, ({ competences }) => !_.isEmpty(competences));
}

module.exports = {
  list,
  listWithPixCompetencesOnly,
};
