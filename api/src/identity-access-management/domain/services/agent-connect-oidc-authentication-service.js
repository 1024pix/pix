import { OidcAuthenticationService } from './oidc-authentication-service.js';

const AGENT_CONNECT_CLAIM_MAPPING = {
  firstName: ['given_name'],
  lastName: ['usual_name'],
  externalIdentityId: ['sub'],
};

export class AgentConnectOidcAuthenticationService extends OidcAuthenticationService {
  constructor(oidcProvider) {
    super({ ...oidcProvider, claimMapping: AGENT_CONNECT_CLAIM_MAPPING });
  }
}
