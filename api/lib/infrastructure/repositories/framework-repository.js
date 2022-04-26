const Framework = require('../../domain/models/Framework');
const frameworkDatasource = require('../datasources/learning-content/framework-datasource');
const { NotFoundError } = require('../../domain/errors');

async function list() {
  const frameworkDataObjects = await frameworkDatasource.list();
  return frameworkDataObjects.map(_toDomain);
}

function _toDomain(frameworkData) {
  return new Framework({
    id: frameworkData.id,
    name: frameworkData.name,
  });
}

async function getByName(name) {
  const framework = await frameworkDatasource.getByName(name);

  if (framework === undefined) {
    throw new NotFoundError(`Framework not found for name ${name}`);
  }
  return _toDomain(framework);
}

module.exports = {
  list,
  getByName,
};
