import { Mission } from '../../domain/models/Mission.js';
import { thematicDatasource } from '../datasources/learning-content/thematic-datasource.js';
import { getTranslatedKey } from '../../domain/services/get-translated-text.js';
import { LOCALE } from '../../../src/shared/domain/constants.js';

const { FRENCH_FRANCE } = LOCALE;

function _toDomain(thematicData, locale) {
  const translatedName = getTranslatedKey(thematicData.name_i18n, locale);
  return new Mission({
    id: thematicData.id,
    name: translatedName,
  });
}

// Les missions sont stockées en tant que thématiques dans PixEditor :)
const get = async function (id, locale = { locale: FRENCH_FRANCE }) {
  const thematicData = await thematicDatasource.get(id);
  return _toDomain(thematicData, locale);
};

export { get };
