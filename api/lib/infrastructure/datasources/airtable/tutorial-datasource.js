const _ = require('lodash');
const airtable = require('../../airtable');
const datasource = require('./datasource');
const AirtableResourceNotFound = require('./AirtableResourceNotFound');

const tableName = 'Tutoriels';

const usedFields = [
  'Durée',
  'Format',
  'Lien',
  'Source',
  'Titre',
];

function fromAirTableObject(airtableTutorialObject) {
  return {
    id: airtableTutorialObject.getId(),
    duration: airtableTutorialObject.get('Durée'),
    format: airtableTutorialObject.get('Format'),
    link: airtableTutorialObject.get('Lien'),
    source: airtableTutorialObject.get('Source'),
    title: airtableTutorialObject.get('Titre'),
  };
}

module.exports = datasource.extend({

  tableName,

  usedFields,

  fromAirTableObject,

  findByRecordIds(tutorialRecordIds) {
    return this.list({ filter: (rawTutorial) => _.includes(tutorialRecordIds, rawTutorial.id) });
  },

  get(id) {
    return airtable.getRecord(tableName, id)
      .then(fromAirTableObject)
      .catch((err) => {
        if (err.error === 'NOT_FOUND') {
          throw new AirtableResourceNotFound();
        }
        throw err;
      });
  },
});

