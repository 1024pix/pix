import CookieStore from 'ember-simple-auth/session-stores/cookie';
import config from '../config/environment';

export default CookieStore.extend({

  cookieDomain: config.authentication.cookieDomain

});
