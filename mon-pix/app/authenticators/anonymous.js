import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import ENV from 'mon-pix/config/environment';
import { decodeToken } from 'mon-pix/helpers/jwt';

export default BaseAuthenticator.extend({
  intl: service(),

  serverTokenEndpoint: `${ENV.APP.API_HOST}/api/token/anonymous`,

  async authenticate({ campaignCode }) {
    const bodyObject = { campaign_code: campaignCode, lang: this.intl.primaryLocale };

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

    const response = await fetch(this.serverTokenEndpoint, options);

    const data = await response.json();
    if (!response.ok) {
      return Promise.reject(data);
    }

    const decodedAccessToken = decodeToken(data.access_token);

    return {
      access_token: data.access_token,
      user_id: decodedAccessToken.user_id,
    };
  },

  restore(data) {
    return new Promise((resolve, reject) => {
      if (!isEmpty(data['access_token'])) {
        resolve(data);
      }
      reject();
    });
  },
});
