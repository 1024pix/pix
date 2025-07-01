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

  setup() {
    this.session = this.getStoredSession();
  }

  async authenticate(username, password) {
    console.log(username, password);

    const obj = { username, password, grant_type: 'password' };
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
    cookies.set('pix-app', authenticated, { expires: 10 });
    cookies.set('pix-app-expiration_time', payload.expires_in, { expires: 10 });

    this.session = session;
  }

  get isAuthenticated() {
    const session = this.session;
    if (session) {
      const expiresAt = session.expires_at;

      if (Date.now() < expiresAt) {
        return true;
      } else {
        this.invalidate();
      }
    }
    return false;
  }

  getStoredSession() {
    const authenticated = cookies.get('pix-app');
    if (authenticated) {
      const parsed = JSON.parse(decodeURIComponent(authenticated));
      return parsed.authenticated;
    }
    return null;
  }

  invalidate() {
    cookies.remove('pix-app');
    cookies.remove('pix-app-expiration_time');
    this.session = null;
  }
}
