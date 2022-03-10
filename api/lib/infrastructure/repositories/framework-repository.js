const Framework = require('../../domain/models/Framework');
const frameworkDatasource = require('../datasources/learning-content/framework-datasource');

async function list() {
  const frameworkDataObjects = await frameworkDatasource.list();
  return frameworkDataObjects.map((frameworkDataObject) => {
    return new Framework({
      id: frameworkDataObject.id,
      name: frameworkDataObject.name,
    });
  });
}

module.exports = {
  list,
};
