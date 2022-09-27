const databaseBuffer = require('../database-buffer');

function buildTraining({
  id = databaseBuffer.getNextId(),
  title = 'title',
  link = 'http://mon-link.com',
  type = 'webinaire',
  duration = '06:00:00',
  locale = 'fr-fr',
} = {}) {
  const values = {
    id,
    title,
    link,
    type,
    duration,
    locale,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'trainings',
    values,
  });
}
module.exports = buildTraining;
