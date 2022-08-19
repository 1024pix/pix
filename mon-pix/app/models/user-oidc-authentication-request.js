import Model, { attr } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';

export default class UserOidcAuthenticationRequest extends Model {
  @attr('string') email;
  @attr('string') password;
  @attr('string') identityProvider;
  @attr('string') authenticationKey;
  @attr('string') accessToken;
  @attr('string') logoutUrlUUID;

  login = memberAction({
    path: 'check-reconciliation',
    type: 'post',
    before() {
      const payload = this.serialize();
      delete payload.data.attributes['access-token'];
      delete payload.data.attributes['logout-url-uuid'];
      return payload;
    },
    after(response) {
      return response?.data?.attributes;
    },
  });
}
