import { OidcAuthenticationService } from './oidc-authentication-service.js';

const CNFPT_CLAIM_MAPPING = {
  firstName: ['given_name'],
  lastName: ['name'],
  externalIdentityId: ['sub'],
};

export class CnfptOidcAuthenticationService extends OidcAuthenticationService {
  constructor(oidcProvider) {
    super({ ...oidcProvider, claimMapping: CNFPT_CLAIM_MAPPING });
  }
}
