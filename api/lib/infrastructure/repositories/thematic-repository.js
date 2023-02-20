import _ from 'lodash';
import Thematic from '../../domain/models/Thematic';
import thematicDatasource from '../datasources/learning-content/thematic-datasource';
import { getTranslatedKey } from '../../domain/services/get-translated-text';
import { LOCALE } from '../../domain/constants';

const { FRENCH_FRANCE: FRENCH_FRANCE } = LOCALE;

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

export default {
  async list({ locale } = { locale: FRENCH_FRANCE }) {
    const thematicDatas = await thematicDatasource.list();
    return thematicDatas.map((thematicData) => _toDomain(thematicData, locale));
  },

  async findByCompetenceIds(competenceIds, locale) {
    const thematicDatas = await thematicDatasource.findByCompetenceIds(competenceIds);
    return thematicDatas.map((thematicData) => _toDomain(thematicData, locale));
  },

  async findByRecordIds(thematicIds, locale) {
    const thematicDatas = await thematicDatasource.findByRecordIds(thematicIds);
    const thematics = thematicDatas.map((thematicData) => _toDomain(thematicData, locale));
    return _.orderBy(thematics, (thematic) => thematic.name.toLowerCase());
  },
};
