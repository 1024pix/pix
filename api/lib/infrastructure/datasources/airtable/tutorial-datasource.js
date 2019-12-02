const _ = require('lodash');
const datasource = require('./datasource');

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

});

