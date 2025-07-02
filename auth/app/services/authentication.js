import Service from '@ember/service';
import Cookies from 'js-cookie';
import { tracked } from '@glimmer/tracking';

const cookies = Cookies.withConverter({
  write: function (value) {
    return value;
  },
});

export default class AuthenticationService extends Service {
  @tracked session = null;
  redirectUri = null;

  setup(redirect_uri) {
    this.redirectUri = decodeURI(redirect_uri);

    this.session = this.getStoredSession();
  }

  getCookieName() {
    const url = new URL(this.redirectUri);
    switch (url.host) {
      case 'localhost:4200':
        return 'pix-app';
      case 'localhost:4201':
        return 'pix-orga';
      case 'localhost:4202':
        return 'pix-admin';
      case 'localhost:4203':
        return 'pix-certif';
      default:
        return 'pix-app';
    }
  }

  async authenticate(username, password) {
    const obj = { username, password, grant_type: 'password' };

    const cookieName = this.getCookieName();

    const body = Object.keys(obj)
      .map((key) => {
        const value = obj[key];

        if (value) {
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        } else {
          return null;
        }
      })
      .filter(Boolean)
      .join('&');

    const response = await fetch('http://localhost:4206/api/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });

    const payload = await response.json();

    const session = {
      authenticator: 'authenticator:oauth2',
      ...payload,
      expires_at: Date.now() + payload.expires_in * 1000,
    };

    const authenticated = encodeURIComponent(
      JSON.stringify({ authenticated: session }),
    );

    cookies.set(cookieName, authenticated, { expires: 10 });
    cookies.set(`${cookieName}-expiration_time`, payload.expires_in, { expires: 10 });

    this.session = session;
  }

  get isAuthenticated() {
    const session = this.session;
    if (session) {
      const expiresAt = session.expires_at;
      return Date.now() < expiresAt;
    }
    return false;
  }

  getStoredSession() {
    const authenticated = cookies.get(this.getCookieName());
    if (authenticated) {
      const parsed = JSON.parse(decodeURIComponent(authenticated));
      return parsed.authenticated;
    }
    return null;
  }

  invalidate() {
    cookies.remove(this.getCookieName());
    cookies.remove(`${this.getCookieName()}-expiration_time`);
    this.session = null;
  }
}
