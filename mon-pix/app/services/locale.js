// This file is the ORIGINAL file. Copies of it are used in all the fronts.
// If you need a change, modify the original file and
// propagate the changes in the copies in all the fronts.

import { getOwner } from '@ember/application';
import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import LanguageDetector from 'i18next-browser-languagedetector';
import ENV from 'mon-pix/config/environment';

const { DEFAULT_LOCALE, SUPPORTED_LOCALES, COOKIE_LOCALE_LIFESPAN_IN_SECONDS } = ENV.APP;

export const FRENCH_FRANCE_LOCALE = 'fr-FR';
export const FRENCH_INTERNATIONAL_LOCALE = 'fr';
export const ENGLISH_INTERNATIONAL_LOCALE = 'en';

const DEFAULT_LANGUAGE = new Intl.Locale(DEFAULT_LOCALE).language;

const PIX_LOCALES = ['de-AT', 'en', 'es', 'es-419', 'fr', 'nl', 'fr-BE', 'fr-FR', 'nl-BE'];

// Currently the challenge locales are not in canonical locales, thus the "fr-fr" value.
// This cannot be changed without migrating the challenges content.
const PIX_CHALLENGE_LOCALES = ['de', 'de-AT', 'en', 'fr', 'fr-fr', 'nl', 'es', 'es-419', 'it'];

const PIX_LANGUAGES = ['fr', 'en', 'nl', 'es'];

const COOKIE_LOCALE = 'locale';

export default class LocaleService extends Service {
  @service featureToggles;
  @service cookies;
  @service currentDomain;
  @service intl;

  @tracked __currentLocale = DEFAULT_LOCALE;

  get currentLocale() {
    return this.__currentLocale;
  }

  get currentLanguage() {
    const language = this.#getLanguageFromLocale(this.currentLocale);
    return this.#getNearestSupportedLanguage(language);
  }

  /**
   * Returns all locales available in this application
   */
  get availableLocales() {
    return this.#getAvailableLocaleDefinitions().map((locale) => locale.value);
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
    return PIX_LANGUAGES;
  }

  get acceptLanguageHeader() {
    if (this.currentDomain.isFranceDomain) return FRENCH_FRANCE_LOCALE;
    return this.currentLanguage;
  }

  get switcherDisplayedLocales() {
    return this.#getAvailableLocaleDefinitions()
      .filter((locale) => locale.displayedInSwitcher)
      .map((displayedLocale) => ({
        value: displayedLocale.value,
        label: displayedLocale.nativeName,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  setCurrentLocale(locale) {
    const nearestLocale = this.#getNearestSupportedLocale(locale);
    this.#setCookieLocale(nearestLocale);
    this.__currentLocale = nearestLocale;

    const language = this.#getLanguageFromLocale(nearestLocale);

    this.intl.setLocale([nearestLocale, language, DEFAULT_LANGUAGE]);

    // dayjsService may not be available for the different front apps
    const dayjsService = getOwner(this).lookup('service:dayjs');
    if (dayjsService) {
      // dayjs supports locale fallback to baseLocale, but dayjsService does not
      dayjsService.setLocale(language);
    }

    // metricsService may not be available for the different front apps
    const metricsService = getOwner(this).lookup('service:metrics');
    if (metricsService) {
      metricsService.context.locale = nearestLocale;
    }
  }

  setBestLocale({ queryParams }) {
    const locale = this.#detectBestLocale({ queryParams });
    this.setCurrentLocale(locale);
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

      if (this.availableLocales.includes(intlLocale.toString())) {
        return intlLocale.toString();
      }

      const localeMatch = this.availableLocales.find((l) => new Intl.Locale(l).language === intlLocale.language);
      if (localeMatch) return localeMatch;

      return DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  }

  #getNearestSupportedLanguage(language) {
    const supportedLanguages = this.pixLanguages.filter((pixLanguage) => this.availableLocales.includes(pixLanguage));
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

  #getAvailableLocaleDefinitions() {
    const disabledLocalesInFrontend = this.featureToggles.featureToggles?.disabledLocalesInFrontend ?? [];
    return SUPPORTED_LOCALES.filter((localeDefinition) => !disabledLocalesInFrontend.includes(localeDefinition.value));
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
