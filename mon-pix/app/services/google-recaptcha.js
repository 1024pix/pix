import classic from 'ember-classic-decorator';
import { assert } from '@ember/debug';
import Service from '@ember/service';
import jQuery from 'jquery';
import RSVP from 'rsvp';
import config from 'mon-pix/config/environment';

// XXX Inspired of https://guides.emberjs.com/v2.13.0/tutorial/service/#toc_fetching-maps-with-a-service
@classic
export default class GoogleRecaptchaService extends Service {
  loadScript() {
    return new RSVP.Promise(function(resolve) {
      jQuery.getScript('https://www.google.com/recaptcha/api.js?onload=onGrecaptchaLoad&render=explicit', function() {
        window.onGrecaptchaLoad = function() {
          resolve();
        };
      });
    });
  }

  render(containerId, callback, expiredCallback) {
    const grecaptcha = window.grecaptcha;
    assert('window.grecaptcha must be available', grecaptcha);
    if (!this.isDestroyed) {
      const parameters = {
        'callback': callback,
        'expired-callback': expiredCallback,
        'sitekey': config.APP.GOOGLE_RECAPTCHA_KEY
      };
      grecaptcha.render(containerId, parameters);
    }
  }

  reset() {
    const grecaptcha = window.grecaptcha;
    grecaptcha.reset();
  }
}
