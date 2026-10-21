import { isEmpty } from '@ember/utils';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import { decodeToken } from 'mon-pix/helpers/jwt';

export default class GarAuthenticator extends BaseAuthenticator {
  static id = 'gar';

  authenticate(token) {
    const token_type = 'bearer';
    const decodedAccessToken = decodeToken(token);

    return Promise.resolve({
      token_type,
      access_token: token,
      user_id: decodedAccessToken.user_id,
      expiresAt: decodedAccessToken.exp * 1000,
      source: decodedAccessToken.source,
    });
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
