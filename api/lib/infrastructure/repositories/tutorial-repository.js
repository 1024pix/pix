const _ = require('lodash');
const Tutorial = require('../../domain/models/Tutorial');
const tutorialDatasource = require('../datasources/airtable/tutorial-datasource');
const { NotFoundError } = require('../../domain/errors');

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
    try {
      const tutorialData = await tutorialDatasource.get(id);
      return _toDomain(tutorialData);
    } catch (error) {
      throw new NotFoundError('Tutorial not found');
    }
  },

};
