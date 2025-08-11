// This file is a COPY of an original file from mon-pix.
// If you need a change, as much as possible modify the original file
// and propagate the changes in the copies in all the fronts

import { getOwner } from '@ember/application';
import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import LanguageDetector from 'i18next-browser-languagedetector';
import ENV from 'pix-certif/config/environment';

const { DEFAULT_LOCALE, SUPPORTED_LOCALES, COOKIE_LOCALE_LIFESPAN_IN_SECONDS } = ENV.APP;

export const FRENCH_FRANCE_LOCALE = 'fr-FR';
export const FRENCH_INTERNATIONAL_LOCALE = 'fr';
export const ENGLISH_INTERNATIONAL_LOCALE = 'en';

const DEFAULT_LANGUAGE = new Intl.Locale(DEFAULT_LOCALE).language;

const PIX_LOCALES = ['en', 'es', 'fr', 'nl', 'fr-BE', 'fr-FR', 'nl-BE'];

// Currently the challenge locales are not in canonical locales, thus the "fr-fr" value.
// This cannot be changed without migrating the challenges content.
const PIX_CHALLENGE_LOCALES = ['en', 'fr', 'fr-fr', 'nl', 'es', 'it', 'de'];

const PIX_LANGUAGES = [
  { value: 'fr', nativeName: 'Français', displayedInSwitcher: true },
  { value: 'en', nativeName: 'English', displayedInSwitcher: true },
  { value: 'nl', nativeName: 'Nederlands', displayedInSwitcher: true },
  { value: 'es', nativeName: 'Español', displayedInSwitcher: false },
];

const COOKIE_LOCALE = 'locale';

export default class LocaleService extends Service {
  @service cookies;
  @service currentDomain;
  @service featureToggles;
  @service intl;
  @service dayjs;

  @tracked __currentLocale = DEFAULT_LOCALE;

  get currentLocale() {
    const localeCookieEnabled = this.featureToggles.featureToggles?.useLocale;
    if (localeCookieEnabled) {
      return this.__currentLocale;
    }

    return this.intl.primaryLocale;
  }

  get currentLanguage() {
    const language = this.#getLanguageFromLocale(this.currentLocale);
    return this.#getNearestSupportedLanguage(language);
  }

  /**
   * Returns all locales supported by this application
   */
  get supportedLocales() {
    return SUPPORTED_LOCALES;
  }

  /**
   * Returns all locales available in the Pix platform
   */
  get pixLocales() {
    return PIX_LOCALES;
  }

  /**
   * Returns all locales available in challenges of the Pix platform
   */
  get pixChallengeLocales() {
    return PIX_CHALLENGE_LOCALES;
  }

  /**
   * Returns all languages available in the Pix platform
   * @deprecated use pixLocales instead whenever possible.
   */
  get pixLanguages() {
    return PIX_LANGUAGES.map((elem) => elem.value);
  }

  get acceptLanguageHeader() {
    if (this.currentDomain.isFranceDomain) return FRENCH_FRANCE_LOCALE;
    return this.currentLanguage;
  }

  get switcherDisplayedLanguages() {
    return PIX_LANGUAGES.filter((elem) => this.supportedLocales.includes(elem.value) && elem.displayedInSwitcher).map(
      (elem) => ({ value: elem.value, label: elem.nativeName }),
    );
  }

  isSupportedLocale(locale) {
    try {
      const localeCanonicalName = Intl.getCanonicalLocales(locale)?.[0];
      return this.supportedLocales.some((supportedLocale) => localeCanonicalName == supportedLocale);
    } catch {
      return false;
    }
  }

  setCurrentLocale(locale) {
    let nearestLocale = locale;

    const localeCookieEnabled = this.featureToggles.featureToggles?.useLocale;
    if (localeCookieEnabled) {
      nearestLocale = this.#getNearestSupportedLocale(locale);
      this.#setCookieLocale(nearestLocale);
      this.__currentLocale = nearestLocale;
    }

    const language = this.#getLanguageFromLocale(nearestLocale);
    this.intl.setLocale(language);
    this.dayjs.setLocale(language);

    // metricsService may not be available for the different front apps
    const metricsService = getOwner(this).lookup('service:metrics');
    if (metricsService) {
      metricsService.context.locale = nearestLocale;
    }
  }

  setBestLocale({ user, queryParams }) {
    const localeCookieEnabled = this.featureToggles.featureToggles?.useLocale;

    let locale;
    if (localeCookieEnabled) {
      locale = this.#detectBestLocale({ queryParams });
    } else {
      locale = this.#detectBestLocaleLegacy({ user, queryParams });
    }
    this.setCurrentLocale(locale);
  }

  #detectBestLocaleLegacy({ user, queryParams }) {
    if (this.currentDomain.isFranceDomain) {
      this.#setCookieLocale(FRENCH_FRANCE_LOCALE);
      return FRENCH_INTERNATIONAL_LOCALE;
    }

    if (queryParams?.lang) {
      return this.#getNearestSupportedLanguage(queryParams?.lang);
    }

    if (user?.lang) {
      return this.#getNearestSupportedLanguage(user.lang);
    }

    return DEFAULT_LOCALE;
  }

  #detectBestLocale({ queryParams }) {
    const { isFranceDomain } = this.currentDomain;
    const languageDetector = new LanguageDetector();

    languageDetector.addDetector({
      name: 'pix-domains',
      lookup() {
        if (isFranceDomain) return FRENCH_FRANCE_LOCALE;
        return null;
      },
    });

    languageDetector.addDetector({
      name: 'pix-query-params',
      lookup() {
        if (queryParams?.lang) return queryParams?.lang;
        if (queryParams?.locale) return queryParams?.locale;
        return null;
      },
    });

    languageDetector.init(null, {
      order: ['pix-domains', 'pix-query-params', 'cookie', 'navigator'],
      lookupCookie: COOKIE_LOCALE,
    });

    const detectedLocale = languageDetector.detect();
    return this.#getNearestSupportedLocale(detectedLocale);
  }

  #getNearestSupportedLocale(locale) {
    if (!locale) return DEFAULT_LOCALE;

    // When 'fr-FR' for org domain, always returns 'fr' instead
    if (!this.currentDomain.isFranceDomain && locale === FRENCH_FRANCE_LOCALE) {
      return FRENCH_INTERNATIONAL_LOCALE;
    }

    try {
      const intlLocale = new Intl.Locale(locale);

      if (this.supportedLocales.includes(intlLocale.toString())) {
        return intlLocale.toString();
      }

      const localeMatch = this.supportedLocales.find((l) => new Intl.Locale(l).language === intlLocale.language);
      if (localeMatch) return localeMatch;

      return DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  }

  #getNearestSupportedLanguage(language) {
    const supportedLanguages = this.pixLanguages.filter((pixLanguage) => this.supportedLocales.includes(pixLanguage));
    return supportedLanguages.includes(language) ? language : DEFAULT_LANGUAGE;
  }

  #getLanguageFromLocale(locale) {
    if (!locale) return DEFAULT_LANGUAGE;
    try {
      return new Intl.Locale(locale).language;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  }

  #setCookieLocale(locale) {
    this.cookies.write(COOKIE_LOCALE, locale, {
      domain: `.${this.currentDomain.domain}`,
      maxAge: COOKIE_LOCALE_LIFESPAN_IN_SECONDS,
      path: '/',
      sameSite: 'Strict',
    });
  }
}
