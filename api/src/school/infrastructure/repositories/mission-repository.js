import { Mission } from '../../domain/models/Mission.js';
import { thematicDatasource } from '../../../shared/infrastructure/datasources/learning-content/thematic-datasource.js';
import { getTranslatedKey } from '../../../../lib/domain/services/get-translated-text.js';
import { LOCALE } from '../../../shared/domain/constants.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

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
  try {
    const thematicData = await thematicDatasource.get(id);
    return _toDomain(thematicData, locale);
  } catch (error) {
    throw new NotFoundError(`Il n'existe pas de mission ayant pour id ${id}`);
  }
};

export { get };
