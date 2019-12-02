const _ = require('lodash');
const datasource = require('./datasource');

module.exports = datasource.extend({

  tableName: 'Tutoriels',

  usedFields: [
    'Durée',
    'Format',
    'Lien',
    'Source',
    'Titre',
  ],

  fromAirTableObject(airtableTutorialObject) {
    return {
      id: airtableTutorialObject.getId(),
      duration: airtableTutorialObject.get('Durée'),
      format: airtableTutorialObject.get('Format'),
      link: airtableTutorialObject.get('Lien'),
      source: airtableTutorialObject.get('Source'),
      title: airtableTutorialObject.get('Titre'),
    };
  },

  findByRecordIds(tutorialRecordIds) {
    return this.list({ filter: (rawTutorial) => _.includes(tutorialRecordIds, rawTutorial.id) });
  },

});

