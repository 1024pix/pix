const _ = require('lodash');
const airtable = require('../airtable');
const Competence = require('../../domain/models/Competence');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const areaDatasource = require('../datasources/airtable/area-datasource');
const Area = require('../../domain/models/Area');

const AIRTABLE_TABLE_NAME = 'Competences';

// TODO: change this repository to use a datasource instead of airtable directly

// TODO : change to get skills as skill objects
function _rawToDomain(rawAirtableCompetence) {
  return new Competence({
    id: rawAirtableCompetence.getId(),
    name: rawAirtableCompetence.get('Titre'),
    index: rawAirtableCompetence.get('Sous-domaine'),
    courseId: rawAirtableCompetence.get('Tests Record ID') ? rawAirtableCompetence.get('Tests Record ID')[0] : '',
    skills: rawAirtableCompetence.get('Acquis (via Tubes)'),
    // TODO: stop relying on Airtable lookup fields to get Area data
    area: new Area({
      id: _.first(rawAirtableCompetence.get('Domaine')),
      code: _.first(rawAirtableCompetence.get('Domaine Code')),
      title: _.first(rawAirtableCompetence.get('Domaine Titre'))
    })
  });
}

function _toDomain(competenceData) {
  return areaDatasource.list()
    .then((areaDatas) => {
      const areaData = competenceData.areaId && _.find(areaDatas, { id: competenceData.areaId });
      return new Competence({
        id: competenceData.id,
        name: competenceData.name,
        index: competenceData.index,
        courseId: competenceData.courseId,
        skills: competenceData.skillIds,
        area: areaData && new Area({
          id: areaData.id,
          code: areaData.code,
          title: areaData.title,
        }),
      });
    });
}

module.exports = {

  /**
   * @deprecated use method #find below
   */
  list() {
    return airtable.findRecords(AIRTABLE_TABLE_NAME, {})
      .then((rawCompetences) => rawCompetences.map(_rawToDomain));
  },

  get(id) {
    return competenceDatasource.get(id)
      .then(_toDomain);
  },

  find() {
    const query = {
      sort: [{ field: 'Sous-domaine', direction: 'asc' }]
    };
    return airtable.findRecords(AIRTABLE_TABLE_NAME, query)
      .then((rawCompetences) => rawCompetences.map(_rawToDomain));
  }
};
