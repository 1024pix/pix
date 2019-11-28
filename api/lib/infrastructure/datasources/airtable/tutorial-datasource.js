const _ = require('lodash');
const airtable = require('../../airtable');
const { Tutorial } = require('./objects');
const AirtableResourceNotFound = require('./AirtableResourceNotFound');

const TABLE_NAME = 'Tutoriels';

const USED_FIELDS = [
  'Durée',
  'Format',
  'Lien',
  'Source',
  'Titre',
];

function fromAirTableObject(airtableTutorialObject) {
  return new Tutorial({
    id: airtableTutorialObject.getId(),
    duration: airtableTutorialObject.get('Durée'),
    format: airtableTutorialObject.get('Format'),
    link: airtableTutorialObject.get('Lien'),
    source: airtableTutorialObject.get('Source'),
    title: airtableTutorialObject.get('Titre'),
  });
}

function _doQuery(filter) {
  return airtable.findRecords(TABLE_NAME, USED_FIELDS)
    .then((rawTutorials) => {
      return _(rawTutorials)
        .filter(filter)
        .map(fromAirTableObject)
        .value();
    });
}

module.exports = {

  tableName: TABLE_NAME,

  usedFields: USED_FIELDS,

  fromAirTableObject,

  findByRecordIds(tutorialRecordIds) {
    return _doQuery((rawTutorial) => _.includes(tutorialRecordIds, rawTutorial.id));
  },

  get(id) {
    return airtable.getRecord(TABLE_NAME, id)
      .then(fromAirTableObject)
      .catch((err) => {
        if (err.error === 'NOT_FOUND') {
          throw new AirtableResourceNotFound();
        }
        throw err;
      });
  },
};

