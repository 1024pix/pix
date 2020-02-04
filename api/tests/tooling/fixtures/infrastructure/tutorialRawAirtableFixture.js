const AirtableRecord = require('airtable').Record;

module.exports = function tutorialRawAirTableFixture() {
  return new AirtableRecord('Tutorial', 'receomyzL0AmpMFGw',{
    'id': 'receomyzL0AmpMFGw',
    'fields': {
      'id': 'receomyzL0AmpMFGw',
      'Durée': '00:01:30',
      'Format': 'video',
      'Lien': 'https://youtube.fr',
      'Source': 'Youtube',
      'Titre':'Comment dresser un panda',
    },
    'createdTime': '2018-01-31T12:41:07.000Z'
  });
};
