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
          title: areaDataObject.title,
          color: areaDataObject.color,
        });
      });
    });
}

function listWithCompetences() {
  return Promise.all([list(), competenceRepository.list()])
    .then(([areas, competences]) => {
      areas.forEach((area) => {
        area.competences = _.filter(competences, { area: { id: area.id } });
      });
      return areas;
    });
}

module.exports = {
  list,
  listWithCompetences,
};
