import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import RSVP from 'rsvp';
import { decodeToken } from 'mon-pix/helpers/jwt';

export default class GarAuthenticator extends BaseAuthenticator {
  authenticate(token, tokenDecoder = decodeToken) {
    const token_type = 'bearer';
    const { user_id, source } = tokenDecoder(token);
    return RSVP.resolve({
      token_type,
      access_token: token,
      user_id,
      source,
    });
  }
}
