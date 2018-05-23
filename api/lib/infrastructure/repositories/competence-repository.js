const _ = require('lodash');
const airtable = require('../airtable');
const Competence = require('../../domain/models/Competence');
const Area = require('../../domain/models/Area');

const AIRTABLE_TABLE_NAME = 'Competences';

function _toDomain(airtableCompetence) {
  return new Competence({
    id: airtableCompetence.getId(),
    name: airtableCompetence.get('Titre'),
    index: airtableCompetence.get('Sous-domaine'),
    courseId: airtableCompetence.get('Tests Record ID') ? airtableCompetence.get('Tests Record ID')[0] : '',
    skills: airtableCompetence.get('Acquis'),
    area: new Area({
      id: _.first(airtableCompetence.get('Domaine')),
      code: _.first(airtableCompetence.get('Domaine Code')),
      title: _.first(airtableCompetence.get('Domaine Titre'))
    })
  });
}

module.exports = {

  /**
   * @deprecated use method #find below
   */
  list() {
    return airtable.findRecords(AIRTABLE_TABLE_NAME, {})
      .then((competences) => competences.map(_toDomain));
  },

  get(recordId) {
    return airtable.newGetRecord(AIRTABLE_TABLE_NAME, recordId)
      .then(_toDomain);
  },

  find() {
    const query = {
      sort: [{ field: 'Sous-domaine', direction: 'asc' }]
    };
    return airtable.findRecords(AIRTABLE_TABLE_NAME, query)
      .then((competences) => competences.map(_toDomain));
  }

};
