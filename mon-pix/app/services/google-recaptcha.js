import { assert } from '@ember/debug';
import Service from '@ember/service';
import RSVP from 'rsvp';
import config from 'mon-pix/config/environment';

// $.getScript alternative with vanilla JavaScript
function getScript(source, cb) {
  let script = document.createElement('script');
  script.async = 1;
  script.onload = script.onreadystatechange = (_, isAbort) => {
    if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
      script.onload = script.onreadystatechange = null;
      script = undefined;
      if (!isAbort && cb) setTimeout(cb, 0);
    }
  };
  script.src = source;

  const prior = document.getElementsByTagName('script')[0];
  prior.parentNode.insertBefore(script, prior);
}

// XXX Inspired of https://guides.emberjs.com/v2.13.0/tutorial/service/#toc_fetching-maps-with-a-service
export default class GoogleRecaptchaService extends Service {
  loadScript() {
    return new RSVP.Promise(function(resolve) {
      getScript('https://www.google.com/recaptcha/api.js?onload=onGrecaptchaLoad&render=explicit', function() {
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
        callback: callback,
        'expired-callback': expiredCallback,
        sitekey: config.APP.GOOGLE_RECAPTCHA_KEY,
      };
      grecaptcha.render(containerId, parameters);
    }
  }

  reset() {
    const grecaptcha = window.grecaptcha;
    grecaptcha.reset();
  }
}
