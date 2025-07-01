import CookieStore from 'ember-simple-auth/session-stores/cookie';

export default class SessionStore extends CookieStore {
  cookieExpirationTime = 1200;
  cookieName = 'pix-app';
}
