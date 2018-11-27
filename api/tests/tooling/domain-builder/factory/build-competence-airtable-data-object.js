const dataObjects = require('../../../../lib/infrastructure/datasources/airtable/objects/index');

module.exports = function buildCompetenceAirtableDataObject({
  id = 'recsvLz0W2ShyfD63',
  name = 'Mener une recherche et une veille d’information',
  index = '1.1',
  areaId = 'recvoGdo7z2z7pXWa',
  courseId = 'recNPB7dTNt5krlMA',
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
    name,
    index,
    areaId,
    courseId,
    skillIds,
  });
};
