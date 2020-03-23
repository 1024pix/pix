const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildBadge({
  id,
  altMessage = faker.random.words(),
  imageUrl = '/img' + faker.random.word() + '.svg',
  message = faker.random.words(),
  key = faker.random.words(),
  targetProfileId,
} = {}) {

  const values = {
    id,
    altMessage,
    imageUrl,
    message,
    key,
    targetProfileId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'badges',
    values,
  });
};
