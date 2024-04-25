import jsonwebtoken from 'jsonwebtoken';

import { OidcAuthenticationService } from '../../../../src/authentication/domain/services/oidc-authentication-service.js';

export class GoogleOidcAuthenticationService extends OidcAuthenticationService {
  constructor(oidcProvider) {
    super(oidcProvider);
  }

  async getUserInfo({ idToken }) {
    const userInfo = jsonwebtoken.decode(idToken);

    return {
      externalIdentityId: userInfo.sub,
      email: userInfo.email,
    };
  }
}
