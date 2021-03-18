const faker = require('faker');
const databaseBuffer = require('../database-buffer');
const buildTargetProfile = require('./build-target-profile');

module.exports = function buildBadge({
  id,
  altMessage = faker.random.words(),
  imageUrl = '/img' + faker.random.word() + '.svg',
  message = faker.random.words(),
  title = faker.random.words(),
  key = faker.random.words(),
  isCertifiable = false,
  targetProfileId,
} = {}) {
  targetProfileId = targetProfileId ? targetProfileId : buildTargetProfile().id;

  const values = {
    id,
    altMessage,
    imageUrl,
    message,
    title,
    key,
    isCertifiable,
    targetProfileId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'badges',
    values,
  });
};
