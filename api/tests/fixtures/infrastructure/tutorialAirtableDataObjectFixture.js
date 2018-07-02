const dataModels = require('../../../lib/infrastructure/datasources/airtable/objects');

module.exports = function() {
  return new dataModels.Tutorial({
    id: 'receomyzL0AmpMFGw',
    duration: '00:01:30',
    format: 'video',
    link: 'https://youtube.fr',
    source: 'Youtube',
    title:'Comment dresser un panda',
  });
};
