import bluebird from 'bluebird';
import _ from 'lodash';

import { Tube } from '../../../src/shared/domain/models/Tube.js';
import { getTranslatedKey } from '../../../src/shared/domain/services/get-translated-text.js';
import {
  skillDatasource,
  tubeDatasource,
} from '../../../src/shared/infrastructure/datasources/learning-content/index.js';

function _toDomain({ tubeData, locale }) {
  const translatedPracticalTitle = getTranslatedKey(tubeData.practicalTitle_i18n, locale);
  const translatedPracticalDescription = getTranslatedKey(tubeData.practicalDescription_i18n, locale);

  return new Tube({
    id: tubeData.id,
    name: tubeData.name,
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

export { findActiveByRecordIds, findByNames, findByRecordIds, get, list };
