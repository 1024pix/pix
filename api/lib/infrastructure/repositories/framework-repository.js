const Framework = require('../../domain/models/Framework');
const frameworkDatasource = require('../datasources/learning-content/framework-datasource');

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

module.exports = {
  list,
};
