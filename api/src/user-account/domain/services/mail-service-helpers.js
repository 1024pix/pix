import enTranslations from '../../../../translations/en.json' assert { type: 'json' };
import frTranslations from '../../../../translations/fr.json' assert { type: 'json' };
import nlTranslations from '../../../../translations/nl.json' assert { type: 'json' };
import { config } from '../../../shared/config.js';
import { LOCALE } from '../../../shared/domain/constants.js';

const { ENGLISH_SPOKEN, FRENCH_SPOKEN, DUTCH_SPOKEN } = LOCALE;

const HELPDESK_FRANCE = `${config.domain.pixSupport + config.domain.tldFr}`;
const HELPDESK_INTERNATIONAL = `${config.domain.pixSupport + config.domain.tldOrg}`;
const PIX_HOME_NAME_FRANCE = `pix${config.domain.tldFr}`;
const PIX_HOME_NAME_INTERNATIONAL = `pix${config.domain.tldOrg}`;
const PIX_HOME_URL_FRANCE = `${config.domain.pix + config.domain.tldFr}`;
const PIX_HOME_URL_INTERNATIONAL = `${config.domain.pix + config.domain.tldOrg}`;
const TRANSLATION_KEY_EMAIL_SENDER_NAME = 'email-sender-name';

function generateEmailFromName({ application = 'pix-app', language }) {
  switch (language) {
    case DUTCH_SPOKEN:
      return nlTranslations[TRANSLATION_KEY_EMAIL_SENDER_NAME][application];
    case ENGLISH_SPOKEN:
      return enTranslations[TRANSLATION_KEY_EMAIL_SENDER_NAME][application];
    default:
      return frTranslations[TRANSLATION_KEY_EMAIL_SENDER_NAME][application];
  }
}

function generateHelpdeskUrl({ domainTld, language }) {
  if (domainTld === config.domain.tldFr) {
    return HELPDESK_FRANCE;
  }

  if (language === FRENCH_SPOKEN) {
    return HELPDESK_INTERNATIONAL;
  }

  return `${HELPDESK_INTERNATIONAL}/${language}/support/home`;
}

function generatePixHomeName(domainTld) {
  if (domainTld === config.domain.tldFr) {
    return PIX_HOME_NAME_FRANCE;
  }

  return PIX_HOME_NAME_INTERNATIONAL;
}

function generatePixHomeUrl({ domainTld, locale }) {
  if (domainTld === config.domain.tldFr) {
    return PIX_HOME_URL_FRANCE;
  }

  return `${PIX_HOME_URL_INTERNATIONAL}/${locale}`;
}

export { generateEmailFromName, generateHelpdeskUrl, generatePixHomeName, generatePixHomeUrl };
