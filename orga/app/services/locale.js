import Service, { service } from '@ember/service';
import config from 'pix-orga/config/environment';
import languages from 'pix-orga/languages';

export const FRENCH_INTERNATIONAL_LOCALE = 'fr';
export const ENGLISH_INTERNATIONAL_LOCALE = 'en';
export const FRENCH_FRANCE_LOCALE = 'fr-FR';
export const DEFAULT_LOCALE = ENGLISH_INTERNATIONAL_LOCALE;
export const SUPPORTED_LANGUAGES = Object.keys(languages);

const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'fr-BE', 'fr-FR', 'nl-BE', 'nl'];
const { COOKIE_LOCALE_LIFESPAN_IN_SECONDS } = config.APP;

export default class LocaleService extends Service {
  @service cookies;
  @service currentDomain;
  @service intl;
  @service dayjs;

  handleUnsupportedLanguage(language) {
    if (!language) return;
    return this.isSupportedLanguage(language) ? language : DEFAULT_LOCALE;
  }

  isSupportedLanguage(language) {
    return SUPPORTED_LANGUAGES.includes(language);
  }

  isSupportedLocale(locale) {
    try {
      const localeCanonicalName = Intl.getCanonicalLocales(locale)?.[0];
      return SUPPORTED_LOCALES.some((supportedLocale) => localeCanonicalName == supportedLocale);
    } catch {
      return false;
    }
  }

  hasLocaleCookie() {
    return this.cookies.exists('locale');
  }

  setLocaleCookie(locale) {
    this.cookies.write('locale', locale, {
      domain: `pix.${this.currentDomain.getExtension()}`,
      maxAge: COOKIE_LOCALE_LIFESPAN_IN_SECONDS,
      path: '/',
      sameSite: 'Strict',
    });
  }

  setLocale(locale) {
    this.intl.setLocale(locale);
    this.dayjs.setLocale(locale);
  }
}
