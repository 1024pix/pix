import { memberAction } from '@1024pix/ember-api-actions';
import Model, { attr } from '@ember-data/model';

export default class UserOidcAuthenticationRequest extends Model {
  @attr('string') email;
  @attr('string') username;
  @attr('string') password;
  @attr('string') identityProvider;
  @attr('string') authenticationKey;
  @attr('string') accessToken;
  @attr('string') logoutUrlUUID;
  @attr('string') fullNameFromPix;
  @attr('string') fullNameFromExternalIdentityProvider;
  @attr() authenticationMethods;

  login = memberAction({
    path: 'check-reconciliation',
    type: 'post',
    before() {
      const payload = this.serialize();
      delete payload.data.attributes['access-token'];
      delete payload.data.attributes['logout-url-uuid'];
      delete payload.data.attributes['username'];
      delete payload.data.attributes['full-name-from-pix'];
      delete payload.data.attributes['full-name-from-external-identity-provider'];
      delete payload.data.attributes['authentication-methods'];
      return payload;
    },
    after(response) {
      if (!response.data?.attributes) return response;

      const attributes = response.data.attributes;
      return {
        fullNameFromPix: attributes['full-name-from-pix'],
        fullNameFromExternalIdentityProvider: attributes['full-name-from-external-identity-provider'],
        email: attributes['email'],
        username: attributes['username'],
        authenticationMethods: attributes['authentication-methods'],
      };
    },
  });
}
