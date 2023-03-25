import Service, { inject as service } from '@ember/service';
import config from 'mon-pix/config/environment';

const { COOKIE_LOCALE_LIFESPAN_IN_SECONDS } = config.APP;

export default class LocaleService extends Service {
  @service cookies;
  @service currentDomain;

  setLocaleCookie(locale) {
    this.cookies.write('locale', locale, {
      domain: `pix.${this.currentDomain.getExtension()}`,
      maxAge: COOKIE_LOCALE_LIFESPAN_IN_SECONDS,
      path: '/',
      sameSite: 'Strict',
    });
  }
}
