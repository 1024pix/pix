import { OidcAuthenticationService } from './oidc-authentication-service.js';

export class CnavOidcAuthenticationService extends OidcAuthenticationService {
  constructor(oidcProvider) {
    super(oidcProvider);
  }
}
