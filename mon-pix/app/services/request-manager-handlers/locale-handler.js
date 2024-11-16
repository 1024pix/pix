import { inject as service } from '@ember/service';

const FRENCH_FRANCE_LOCALE = 'fr-fr';

/**
 * Request manager handler adding user locale in request header.
 * See: https://github.com/emberjs/data/blob/main/guides/requests/examples/1-auth.md
 */
export default class LocaleHandler {
  @service currentDomain;
  @service intl;

  request(context, next) {
    const headers = new Headers(context.request.headers);

    headers.append('Accept-Language', this._locale);

    return next(Object.assign({}, context.request, { headers }));
  }

  get _locale() {
    if (this.currentDomain.isFranceDomain) return FRENCH_FRANCE_LOCALE;
    return this.intl.primaryLocale;
  }
}
