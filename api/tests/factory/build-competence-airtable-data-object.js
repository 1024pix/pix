const dataObjects = require('../../lib/infrastructure/datasources/airtable/objects/index');

module.exports = function({
  id = 'recsvLz0W2ShyfD63',
  competenceCode = '1.1',
  title = 'Mener une recherche et une veille d’information',
  areaIds = ['recvoGdo7z2z7pXWa'],
  courseIds = [
    'rec02tVrimXNkgaLD',
    'rec0gm0GFue3PQB3k',
    'rec0hoSlSwCeNNLkq',
    'rec2FcZ4jsPuY1QYt',
    'rec39bDMnaVw3MyMR',
    'rec3FMoD8h9USTktb',
    'rec3P7fvPSpFkIFLV',
  ],

  skillIds = [
    'recV11ibSCXvaUzZd',
    'recD01ptfJy7c4Sex',
    'recfO8994EvSQV9Ip',
    'recDMMeHSZRCjqo5x',
    'reci0phtJi0lvqW9j',
    'recUQSpjuDvwqKMst',
    'recxqogrKZ9p8b1u8',
    'recRV35kIeqUQj8cI',
    'rec50NXHkatsRkjVQ',
  ],
} = {}) {

  return new dataObjects.Competence({
    id,
    competenceCode,
    title,
    areaIds,
    courseIds,
    skillIds,
  });
};

