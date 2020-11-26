const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildStage({
  id,
  message = faker.random.words(),
  title = faker.random.words(),
  threshold = 20,
  targetProfileId,
} = {}) {

  const values = {
    id,
    message,
    title,
    threshold,
    targetProfileId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'stages',
    values,
  });
};
