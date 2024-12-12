import _ from 'lodash';

import { LOCALE } from '../../../src/shared/domain/constants.js';
import { Thematic } from '../../../src/shared/domain/models/Thematic.js';
import { getTranslatedKey } from '../../../src/shared/domain/services/get-translated-text.js';
import { thematicDatasource } from '../../../src/shared/infrastructure/datasources/learning-content/thematic-datasource.js';

const { FRENCH_FRANCE } = LOCALE;

function _toDomain(thematicData, locale) {
  const translatedName = getTranslatedKey(thematicData.name_i18n, locale);
  return new Thematic({
    id: thematicData.id,
    name: translatedName,
    index: thematicData.index,
    tubeIds: thematicData.tubeIds,
    competenceId: thematicData.competenceId,
  });
}

const list = async function ({ locale } = { locale: FRENCH_FRANCE }) {
  const thematicDatas = await thematicDatasource.list();
  return thematicDatas.map((thematicData) => _toDomain(thematicData, locale));
};

const findByCompetenceIds = async function (competenceIds, locale) {
  const thematicDatas = await thematicDatasource.findByCompetenceIds(competenceIds);
  return thematicDatas.map((thematicData) => _toDomain(thematicData, locale));
};

const findByRecordIds = async function (thematicIds, locale) {
  const thematicDatas = await thematicDatasource.findByRecordIds(thematicIds);
  const thematics = thematicDatas.map((thematicData) => _toDomain(thematicData, locale));
  return _.orderBy(thematics, (thematic) => thematic.name.toLowerCase());
};

export { findByCompetenceIds, findByRecordIds, list };
