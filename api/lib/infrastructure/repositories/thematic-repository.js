const _ = require('lodash');
const Thematic = require('../../domain/models/Thematic.js');
const thematicDatasource = require('../datasources/learning-content/thematic-datasource.js');
const { getTranslatedKey } = require('../../domain/services/get-translated-text.js');
const { FRENCH_FRANCE } = require('../../domain/constants.js').LOCALE;

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

module.exports = {
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
