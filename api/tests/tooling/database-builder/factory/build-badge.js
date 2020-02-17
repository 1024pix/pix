const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildBadge({
  id,
  imageUrl = '/img' + faker.random.word() + '.svg',
  message = faker.random.words(),
  targetProfileId,
} = {}) {

  const values = {
    id,
    imageUrl,
    message,
    targetProfileId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'badges',
    values,
  });
};
