import _ from 'lodash';
import bluebird from 'bluebird';
import { Tube } from '../../domain/models/Tube.js';
import { tubeDatasource } from '../datasources/learning-content/tube-datasource.js';
import { skillDatasource } from '../datasources/learning-content/skill-datasource.js';
import { getTranslatedKey } from '../../domain/services/get-translated-text.js';

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

const get = async function (id) {
  const tubeData = await tubeDatasource.get(id);
  return _toDomain({ tubeData });
};

const list = async function () {
  const tubeDatas = await tubeDatasource.list();
  const tubes = _.map(tubeDatas, (tubeData) => _toDomain({ tubeData }));
  return _.orderBy(tubes, (tube) => tube.name.toLowerCase());
};

const findByNames = async function ({ tubeNames, locale }) {
  const tubeDatas = await tubeDatasource.findByNames(tubeNames);
  const tubes = _.map(tubeDatas, (tubeData) => _toDomain({ tubeData, locale }));
  return _.orderBy(tubes, (tube) => tube.name.toLowerCase());
};

const findByRecordIds = async function (tubeIds, locale) {
  const tubeDatas = await tubeDatasource.findByRecordIds(tubeIds);
  const tubes = _.map(tubeDatas, (tubeData) => _toDomain({ tubeData, locale }));
  return _.orderBy(tubes, (tube) => tube.name.toLowerCase());
};

const findActiveByRecordIds = async function (tubeIds, locale) {
  const tubeDatas = await tubeDatasource.findByRecordIds(tubeIds);
  const activeTubes = await _findActive(tubeDatas);
  const tubes = _.map(activeTubes, (tubeData) => _toDomain({ tubeData, locale }));
  return _.orderBy(tubes, (tube) => tube.name.toLowerCase());
};

export { get, list, findByNames, findByRecordIds, findActiveByRecordIds };
