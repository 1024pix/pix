const _ = require('lodash');
const airtable = require('../airtable');
const Competence = require('../../domain/models/Competence');
const Area = require('../../domain/models/Area');

const AIRTABLE_TABLE_NAME = 'Competences';

// TODO: change this repository to use a datasource instead of airtable directly

// TODO : change to get skills as skill objects
function _toDomain(rawAirtableCompetence) {
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

module.exports = {

  /**
   * @deprecated use method #find below
   */
  list() {
    return airtable.findRecords(AIRTABLE_TABLE_NAME, {})
      .then((rawCompetences) => rawCompetences.map(_toDomain));
  },

  get(recordId) {
    return airtable.getRecord(AIRTABLE_TABLE_NAME, recordId)
      .then(_toDomain);
  },

  find() {
    const query = {
      sort: [{ field: 'Sous-domaine', direction: 'asc' }]
    };
    return airtable.findRecords(AIRTABLE_TABLE_NAME, query)
      .then((rawCompetences) => rawCompetences.map(_toDomain));
  }
};
