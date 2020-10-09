const databaseBuffer = require('../database-buffer');
const faker = require('faker');

module.exports = function buildTag({
  id,
  name = faker.random.words(),
} = {}) {

  const values = {
    id,
    name,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'tags',
    values,
  });
};
