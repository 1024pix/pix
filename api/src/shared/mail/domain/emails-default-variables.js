import { config } from '../../config.js';
import { DUTCH_SPOKEN, ENGLISH_SPOKEN, FRENCH_SPOKEN, SPANISH_SPOKEN } from '../../domain/services/locale-service.js';

// FRENCH_FRANCE
const PIX_HOME_URL_FRENCH_FRANCE = `${config.domain.pix + config.domain.tldFr}`;
const PIX_APP_URL_FRENCH_FRANCE = `${config.domain.pixApp + config.domain.tldFr}`;
const PIX_ORGA_HOME_URL_FRENCH_FRANCE = `${config.domain.pixOrga + config.domain.tldFr}`;
const PIX_CERTIF_HOME_URL_FRENCH_FRANCE = `${config.domain.pixCertif + config.domain.tldFr}`;

const PIX_APP_CONNECTION_URL_FRENCH_FRANCE = `${PIX_APP_URL_FRENCH_FRANCE}/connexion`;
const HELPDESK_FRENCH_FRANCE = 'https://pix.fr/support';

// INTERNATIONAL
const PIX_HOME_URL_INTERNATIONAL_BASE = `${config.domain.pix + config.domain.tldOrg}`;
const PIX_APP_URL_INTERNATIONAL = `${config.domain.pixApp + config.domain.tldOrg}`;
const PIX_ORGA_HOME_URL_INTERNATIONAL = `${config.domain.pixOrga + config.domain.tldOrg}`;
const PIX_CERTIF_HOME_URL_INTERNATIONAL = `${config.domain.pixCertif + config.domain.tldOrg}`;

const PIX_HOME_URL_INTERNATIONAL = {
  en: `${PIX_HOME_URL_INTERNATIONAL_BASE}/en/`,
  es: `${PIX_HOME_URL_INTERNATIONAL_BASE}/en/`,
  fr: `${PIX_HOME_URL_INTERNATIONAL_BASE}/fr/`,
  nl: `${PIX_HOME_URL_INTERNATIONAL_BASE}/nl-be/`,
};
const PIX_APP_CONNECTION_URL_INTERNATIONAL = {
  en: `${PIX_APP_URL_INTERNATIONAL}/connexion/?lang=en`,
  es: `${PIX_APP_URL_INTERNATIONAL}/connexion/?lang=es`,
  fr: `${PIX_APP_URL_INTERNATIONAL}/connexion/?lang=fr`,
  nl: `${PIX_APP_URL_INTERNATIONAL}/connexion/?lang=nl`,
};
const PIX_HELPDESK_URL_INTERNATIONAL = {
  en: `${PIX_HOME_URL_INTERNATIONAL['en']}support`,
  es: `${PIX_HOME_URL_INTERNATIONAL['es']}support`,
  fr: `${PIX_HOME_URL_INTERNATIONAL['fr']}support`,
  nl: `${PIX_HOME_URL_INTERNATIONAL['nl']}support`,
};

export function getEmailDefaultVariables(locale) {
  switch (locale) {
    case FRENCH_SPOKEN:
    case SPANISH_SPOKEN:
    case ENGLISH_SPOKEN:
    case DUTCH_SPOKEN:
      return {
        homeName: `pix${config.domain.tldOrg}`,
        homeUrl: PIX_HOME_URL_INTERNATIONAL[locale] ?? PIX_HOME_URL_INTERNATIONAL.en,
        pixOrgaHomeUrl: PIX_ORGA_HOME_URL_INTERNATIONAL,
        pixCertifHomeUrl: PIX_CERTIF_HOME_URL_INTERNATIONAL,
        pixAppConnectionUrl: PIX_APP_CONNECTION_URL_INTERNATIONAL[locale] ?? PIX_APP_CONNECTION_URL_INTERNATIONAL.en,
        helpdeskUrl: PIX_HELPDESK_URL_INTERNATIONAL[locale] ?? PIX_HELPDESK_URL_INTERNATIONAL.en,
        displayNationalLogo: false,
      };
    default:
      return {
        homeName: `pix${config.domain.tldFr}`,
        homeUrl: PIX_HOME_URL_FRENCH_FRANCE,
        pixOrgaHomeUrl: PIX_ORGA_HOME_URL_FRENCH_FRANCE,
        pixCertifHomeUrl: PIX_CERTIF_HOME_URL_FRENCH_FRANCE,
        pixAppConnectionUrl: PIX_APP_CONNECTION_URL_FRENCH_FRANCE,
        helpdeskUrl: HELPDESK_FRENCH_FRANCE,
        displayNationalLogo: true,
      };
  }
}
