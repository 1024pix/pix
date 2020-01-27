const _ = require('lodash');
const Competence = require('../../domain/models/Competence');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const areaDatasource = require('../datasources/airtable/area-datasource');
const Area = require('../../domain/models/Area');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(competenceData, areaDatas) {
  const areaData = competenceData.areaId && _.find(areaDatas, { id: competenceData.areaId });
  return new Competence({
    id: competenceData.id,
    name: competenceData.name,
    index: competenceData.index,
    description: competenceData.description,
    courseId: competenceData.courseId,
    skills: competenceData.skillIds,
    area: areaData && new Area({
      id: areaData.id,
      code: areaData.code,
      title: areaData.title,
      color: areaData.color,
    }),
  });
}

module.exports = {

  list() {
    return Promise.all([competenceDatasource.list(), areaDatasource.list()])
      .then(([competenceDatas, areaDatas]) => {
        return _.sortBy(
          competenceDatas.map((competenceData) => _toDomain(competenceData, areaDatas)),
          'index'
        );
      });
  },

  get(id) {
    return Promise.all([competenceDatasource.get(id), areaDatasource.list()])
      .then(([competenceData, areaDatas]) => _toDomain(competenceData, areaDatas));
  },

  getCompetenceName(id) {
    return competenceDatasource.get(id)
      .then((competence) => {
        return competence.name;
      })
      .catch(() => {
        throw new NotFoundError('La compétence demandée n\'existe pas');
      });
  }
};
