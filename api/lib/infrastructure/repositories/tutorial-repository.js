const Tutorial = require('../../domain/models/Tutorial');
const tutorialDatasource = require('../datasources/airtable/tutorial-datasource');
const _ = require('lodash');

function _toDomain(tutorialData) {
  return new Tutorial({
    id: tutorialData.id,
    duration: tutorialData.duration,
    format: tutorialData.format,
    link: tutorialData.link,
    source: tutorialData.source,
    title: tutorialData.title,
  });
}

module.exports = {
  async findByRecordIds(ids) {
    const tutorialDatas = await tutorialDatasource.findByRecordIds(ids);
    return _.map(tutorialDatas, (tutorialData) => _toDomain(tutorialData));
  },

  async get(id) {
    const tutorialData = await tutorialDatasource.get(id);
    return _toDomain(tutorialData);
  },

};
