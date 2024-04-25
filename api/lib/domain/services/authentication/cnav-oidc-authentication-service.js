import { OidcAuthenticationService } from '../../../../src/authentication/domain/services/oidc-authentication-service.js';

export class CnavOidcAuthenticationService extends OidcAuthenticationService {
  constructor(oidcProvider) {
    super(oidcProvider);
  }
}
