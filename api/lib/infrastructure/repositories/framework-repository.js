import _ from 'lodash';

import { NotFoundError } from '../../../src/shared/domain/errors.js';
import { Framework } from '../../../src/shared/domain/models/Framework.js';
import { frameworkDatasource } from '../../../src/shared/infrastructure/datasources/learning-content/framework-datasource.js';

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

export { findByRecordIds, getByName, list };
