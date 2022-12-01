const _ = require('lodash');
const bluebird = require('bluebird');
const Tube = require('../../domain/models/Tube');
const tubeDatasource = require('../datasources/learning-content/tube-datasource');
const skillDatasource = require('../datasources/learning-content/skill-datasource');

const { getTranslatedKey } = require('../../domain/services/get-translated-text');

function _toDomain({ tubeData, locale }) {
  const translatedPracticalTitle = getTranslatedKey(tubeData.practicalTitle_i18n, locale);
  const translatedPracticalDescription = getTranslatedKey(tubeData.practicalDescription_i18n, locale);

  return new Tube({
    id: tubeData.id,
    name: tubeData.name,
    title: tubeData.title,
    description: tubeData.description,
    practicalTitle: translatedPracticalTitle,
    practicalDescription: translatedPracticalDescription,
    isMobileCompliant: tubeData.isMobileCompliant,
    isTabletCompliant: tubeData.isTabletCompliant,
    competenceId: tubeData.competenceId,
    thematicId: tubeData.thematicId,
    skillIds: tubeData.skillIds,
  });
}

async function _findActive(tubes) {
  return bluebird.filter(tubes, async ({ id: tubeId }) => {
    const activeSkills = await skillDatasource.findActiveByTubeId(tubeId);
    return activeSkills.length > 0;
  });
}

module.exports = {
  async get(id) {
    const tubeData = await tubeDatasource.get(id);
    return _toDomain({ tubeData });
  },

  async list() {
    const tubeDatas = await tubeDatasource.list();
    const tubes = _.map(tubeDatas, (tubeData) => _toDomain({ tubeData }));
    return _.orderBy(tubes, (tube) => tube.name.toLowerCase());
  },

  async findByNames({ tubeNames, locale }) {
    const tubeDatas = await tubeDatasource.findByNames(tubeNames);
    const tubes = _.map(tubeDatas, (tubeData) => _toDomain({ tubeData, locale }));
    return _.orderBy(tubes, (tube) => tube.name.toLowerCase());
  },

  async findByRecordIds(tubeIds, locale) {
    const tubeDatas = await tubeDatasource.findByRecordIds(tubeIds);
    const tubes = _.map(tubeDatas, (tubeData) => _toDomain({ tubeData, locale }));
    return _.orderBy(tubes, (tube) => tube.name.toLowerCase());
  },

  async findActiveByRecordIds(tubeIds, locale) {
    const tubeDatas = await tubeDatasource.findByRecordIds(tubeIds);
    const activeTubes = await _findActive(tubeDatas);
    const tubes = _.map(activeTubes, (tubeData) => _toDomain({ tubeData, locale }));
    return _.orderBy(tubes, (tube) => tube.name.toLowerCase());
  },
};
