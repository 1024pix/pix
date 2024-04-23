import { PROSANTECONNECT } from '../../../../lib/domain/constants/oidc-identity-providers.js';
import { config } from '../../../shared/config.js';
import { OidcAuthenticationService } from './oidc-authentication-service.js';

const configKey = PROSANTECONNECT.configKey;

export class ProSanteConnectOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    super({
      accessTokenLifespanMs: config[configKey].accessTokenLifespanMs,
      clientId: config[configKey].clientId,
      clientSecret: config[configKey].clientSecret,
      configKey,
      identityProvider: PROSANTECONNECT.code,
      openidConfigurationUrl: config[configKey].openidConfigurationUrl,
      organizationName: 'Pro Santé Connect',
      postLogoutRedirectUri: config[configKey].postLogoutRedirectUri,
      redirectUri: config[configKey].redirectUri,
      scope: config[configKey].scope,
      shouldCloseSession: true,
      slug: 'pro-sante-connect',
      source: 'prosanteconnect',
    });
  }
}
