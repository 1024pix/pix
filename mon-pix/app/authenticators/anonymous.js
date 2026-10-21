import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import ENV from 'mon-pix/config/environment';
import { decodeToken } from 'mon-pix/helpers/jwt';

export default class AnonymousAuthenticator extends BaseAuthenticator {
  static id = 'anonymous';

  @service locale;

  async authenticate({ campaignCode }) {
    const bodyObject = { campaign_code: campaignCode, lang: this.locale.currentLanguage };

    const body = Object.keys(bodyObject)
      .map((k) => `${k}=${encodeURIComponent(bodyObject[k])}`)
      .join('&');

    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    };

    const url = `${ENV.APP.API_HOST}/api/token/anonymous`;
    const response = await fetch(url, options);

    const data = await response.json();
    if (!response.ok) {
      return Promise.reject(data);
    }

    const decodedAccessToken = decodeToken(data.access_token);

    return {
      access_token: data.access_token,
      user_id: decodedAccessToken.user_id,
      expiresAt: decodedAccessToken.exp * 1000,
    };
  }

  restore(data) {
    return new Promise((resolve, reject) => {
      if (isEmpty(data['access_token'])) {
        reject();
      }
      if (data.expiresAt <= new Date().getTime()) {
        reject();
      }

      resolve(data);
    });
  }
}
