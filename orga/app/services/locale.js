import Service, { inject as service } from '@ember/service';
import config from 'pix-orga/config/environment';

const { COOKIE_LOCALE_LIFESPAN_IN_SECONDS } = config.APP;

export default class LocaleService extends Service {
  @service cookies;
  @service currentDomain;

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
