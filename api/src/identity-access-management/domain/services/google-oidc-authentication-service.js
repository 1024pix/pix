import { OidcAuthenticationService } from './oidc-authentication-service.js';

const GOOGLE_CLAIM_MAPPING = {
  email: ['email'],
  externalIdentityId: ['sub'],
};

export class GoogleOidcAuthenticationService extends OidcAuthenticationService {
  constructor(oidcProvider) {
    super({ ...oidcProvider, claimMapping: GOOGLE_CLAIM_MAPPING });
  }
}
