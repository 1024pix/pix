import { OidcAuthenticationService } from './oidc-authentication-service.js';

export class ProSanteConnectOidcAuthenticationService extends OidcAuthenticationService {
  constructor(oidcProvider) {
    super(oidcProvider);
  }
}
