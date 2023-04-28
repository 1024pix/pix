import Service, { inject as service } from '@ember/service';
import config from 'mon-pix/config/environment';

const { COOKIE_LOCALE_LIFESPAN_IN_SECONDS } = config.APP;
export const DEFAULT_LOCALE = 'fr';
export const FRENCH_INTERNATIONAL_LOCALE = 'fr';
export const ENGLISH_INTERNATIONAL_LOCALE = 'en';

const supportedLanguages = [FRENCH_INTERNATIONAL_LOCALE, ENGLISH_INTERNATIONAL_LOCALE];

export default class LocaleService extends Service {
  @service cookies;
  @service currentDomain;

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
}
