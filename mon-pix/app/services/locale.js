import Service, { inject as service } from '@ember/service';
import config from 'mon-pix/config/environment';
import languages from 'mon-pix/languages';

const { COOKIE_LOCALE_LIFESPAN_IN_SECONDS } = config.APP;
export const FRENCH_INTERNATIONAL_LOCALE = 'fr';
export const ENGLISH_INTERNATIONAL_LOCALE = 'en';
export const FRENCH_FRANCE_LOCALE = 'fr-FR';
export const DEFAULT_LOCALE = FRENCH_INTERNATIONAL_LOCALE;

const supportedLanguages = Object.keys(languages);

export default class LocaleService extends Service {
  @service cookies;
  @service currentDomain;
  @service intl;
  @service dayjs;

  handleUnsupportedLanguage(language) {
    if (!language) return;
    return supportedLanguages.includes(language) ? language : DEFAULT_LOCALE;
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
