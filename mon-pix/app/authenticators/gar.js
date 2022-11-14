import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import RSVP from 'rsvp';
import { decodeToken } from 'mon-pix/helpers/jwt';

export default class GarAuthenticator extends BaseAuthenticator {
  authenticate(token) {
    const token_type = 'bearer';
    const decodedAccessToken = decodeToken(token);
    const user_id = decodedAccessToken.user_id;
    const source = decodedAccessToken.source;
    return RSVP.resolve({
      token_type,
      access_token: token,
      user_id,
      source,
    });
  }
}
