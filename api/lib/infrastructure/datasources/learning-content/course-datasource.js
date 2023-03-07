const datasource = require('./datasource.js');

const courseDatasource = datasource.extend({
  modelName: 'courses',
});

module.exports = { courseDatasource };
