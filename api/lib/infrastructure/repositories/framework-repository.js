const Framework = require('../../domain/models/Framework.js');
const frameworkDatasource = require('../datasources/learning-content/framework-datasource.js');
const { NotFoundError } = require('../../domain/errors.js');
const _ = require('lodash');

async function list() {
  const frameworkDataObjects = await frameworkDatasource.list();
  return frameworkDataObjects.map(_toDomain);
}

function _toDomain(frameworkData) {
  return new Framework({
    id: frameworkData.id,
    name: frameworkData.name,
    areas: [],
  });
}

async function getByName(name) {
  const framework = await frameworkDatasource.getByName(name);

  if (framework === undefined) {
    throw new NotFoundError(`Framework not found for name ${name}`);
  }
  return _toDomain(framework);
}

async function findByRecordIds(frameworkIds) {
  const frameworkDatas = await frameworkDatasource.findByRecordIds(frameworkIds);
  const frameworks = _.map(frameworkDatas, (frameworkData) => _toDomain(frameworkData));
  return _.orderBy(frameworks, (framework) => framework.name.toLowerCase());
}

module.exports = {
  list,
  getByName,
  findByRecordIds,
};
