import { LOCALE } from '../../domain/constants';

const { FRENCH_SPOKEN: FRENCH_SPOKEN } = LOCALE;

function getTranslatedKey(key, locale) {
  return key?.[locale] || key?.[FRENCH_SPOKEN];
}

export default { getTranslatedKey };
