import Service, { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default class UserOidcAuthenticationRequestService extends Service {
  @service requestManager;

  async login({ password, email, authenticationKey, identityProvider }) {
    const response = await this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/oidc/user/check-reconciliation`,
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'user-oidc-authentication-requests',
          attributes: {
            password,
            email,
            'authentication-key': authenticationKey,
            'identity-provider': identityProvider,
          },
        },
      }),
    });
    const { attributes } = response.content.data;
    return {
      email: attributes['email'],
      username: attributes['username'],
      authenticationMethods: attributes['authentication-methods'],
      fullNameFromPix: attributes['full-name-from-pix'],
      fullNameFromExternalIdentityProvider: attributes['full-name-from-external-identity-provider'],
    };
  }
}
