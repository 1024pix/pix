const cache = require('../cache');
const airtable = require('../airtable');
const serializer = require('../serializers/airtable/competence-serializer');
const Competence = require('../../domain/models/Competence');

const AIRTABLE_TABLE_NAME = 'Competences';

function _toDomain(airtableCompetence) {
  return new Competence({
    id: airtableCompetence.getId(),
    name: airtableCompetence.get('Titre'),
    index: airtableCompetence.get('Sous-domaine')
  });
}

module.exports = {

  /**
   * @deprecated use method #find below
   */
  list() {
    const cacheKey = 'competence-repository_list';
    const cachedCompetences = cache.get(cacheKey);

    if (cachedCompetences) {
      return Promise.resolve(cachedCompetences);
    }

    return airtable
      .getRecords(AIRTABLE_TABLE_NAME, {}, serializer)
      .then((competences) => {
        cache.set(cacheKey, competences);
        return competences;
      });
  },

  get(recordId) {
    const cacheKey = `competence-repository_get_${recordId}`;
    const cachedCompetence = cache.get(cacheKey);

    if (cachedCompetence) {
      return Promise.resolve(cachedCompetence);
    }

    return airtable.getRecord(AIRTABLE_TABLE_NAME, recordId, serializer)
      .then((competence) => {
        cache.set(cacheKey, competence);
        return competence;
      });
  },

  find() {
    const query = {
      sort: [{ field: 'Sous-domaine', direction: 'asc' }]
    };
    return airtable.findRecords('Competences', query)
      .then((competences) => {
        return competences.map(_toDomain);
      });
  }

};
