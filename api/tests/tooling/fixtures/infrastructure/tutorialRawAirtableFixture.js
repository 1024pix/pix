const AirtableRecord = require('airtable').Record;

module.exports = function tutorialRawAirTableFixture({ id } = { id: 'receomyzL0AmpMFGw' }) {
  return new AirtableRecord('Tutorial', id, {
    'id': id,
    'fields': {
      'id persistant': id,
      'Durée': '00:01:30',
      'Format': 'video',
      'Lien': 'https://youtube.fr',
      'Source': 'Youtube',
      'Titre':'Comment dresser un panda',
    },
    'createdTime': '2018-01-31T12:41:07.000Z'
  });
};
