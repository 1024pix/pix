import { CnavOidcAuthenticationService } from '../../../../src/authentication/domain/services/cnav-oidc-authentication-service.js';
import { FwbOidcAuthenticationService } from '../../../../src/authentication/domain/services/fwb-oidc-authentication-service.js';
import { GoogleOidcAuthenticationService } from '../../../../src/authentication/domain/services/google-oidc-authentication-service.js';
import { PaysdelaloireOidcAuthenticationService } from '../../../../src/authentication/domain/services/paysdelaloire-oidc-authentication-service.js';
import { PoleEmploiOidcAuthenticationService } from '../../../../src/authentication/domain/services/pole-emploi-oidc-authentication-service.js';
import { ProSanteConnectOidcAuthenticationService } from '../../../../src/authentication/domain/services/pro-sante-connect-oidc-authentication.service.js';
import { oidcProviderRepository } from '../../../../src/authentication/infrastructure/repositories/oidc-provider-repository.js';
import { cryptoService } from '../../../../src/shared/domain/services/crypto-service.js';
import { InvalidIdentityProviderError } from '../../errors.js';

export class OidcAuthenticationServiceRegistry {
  #allOidcProviderServices = null;
  #readyOidcProviderServices = null;
  #readyOidcProviderServicesForPixAdmin = null;

  constructor(dependencies = {}) {
    this.oidcProviderRepository = dependencies.oidcProviderRepository;
  }

  async configureReadyOidcProviderServiceByCode(oidcProviderServiceCode) {
    const oidcProviderService = this.#allOidcProviderServices?.find(
      (oidcProviderService) => oidcProviderService.code === oidcProviderServiceCode,
    );

    if (!oidcProviderService) return;
    if (oidcProviderService.client) return;

    await oidcProviderService.createClient();
    return true;
  }

  getAllOidcProviderServices() {
    return this.#allOidcProviderServices;
  }

  getReadyOidcProviderServices() {
    return this.#readyOidcProviderServices;
  }

  getReadyOidcProviderServicesForPixAdmin() {
    return this.#readyOidcProviderServicesForPixAdmin;
  }

  getOidcProviderServiceByCode({ identityProviderCode, audience = 'app' }) {
    const services =
      audience === 'admin' ? this.#readyOidcProviderServicesForPixAdmin : this.#readyOidcProviderServices;
    const oidcProviderService = services.find((service) => identityProviderCode === service.code);

    if (!oidcProviderService) {
      throw new InvalidIdentityProviderError(identityProviderCode);
    }

    return oidcProviderService;
  }

  async loadOidcProviderServices(oidcProviderServices) {
    if (this.#allOidcProviderServices) {
      return;
    }

    if (!oidcProviderServices) {
      const oidcProviders = await oidcProviderRepository.findAllOidcProviders();
      oidcProviderServices = await Promise.all(
        oidcProviders.map(async (oidcProvider) => {
          await oidcProvider.decryptClientSecret(cryptoService);
          switch (oidcProvider.identityProvider) {
            case 'FWB':
              return new FwbOidcAuthenticationService(oidcProvider);
            case 'CNAV':
              return new CnavOidcAuthenticationService(oidcProvider);
            case 'PAYSDELALOIRE':
              return new PaysdelaloireOidcAuthenticationService(oidcProvider);
            case 'GOOGLE':
              return new GoogleOidcAuthenticationService(oidcProvider);
            case 'POLE_EMPLOI':
              return new PoleEmploiOidcAuthenticationService(oidcProvider);
            case 'PROSANTECONNECT':
              return new ProSanteConnectOidcAuthenticationService(oidcProvider);
          }
        }),
      );
    }

    this.#allOidcProviderServices = oidcProviderServices;
    this.#readyOidcProviderServices = this.#allOidcProviderServices.filter(
      (oidcProviderService) => oidcProviderService.isReady,
    );
    this.#readyOidcProviderServicesForPixAdmin = this.#allOidcProviderServices.filter(
      (oidcProviderService) => oidcProviderService.isReadyForPixAdmin,
    );
    return true;
  }
}
