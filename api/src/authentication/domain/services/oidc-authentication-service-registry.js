import { InvalidIdentityProviderError } from '../../../../lib/domain/errors.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { oidcProviderRepository } from '../../infrastructure/repositories/oidc-provider-repository.js';
import { CnavOidcAuthenticationService } from './cnav-oidc-authentication-service.js';
import { FwbOidcAuthenticationService } from './fwb-oidc-authentication-service.js';
import { GoogleOidcAuthenticationService } from './google-oidc-authentication-service.js';
import { PaysdelaloireOidcAuthenticationService } from './paysdelaloire-oidc-authentication-service.js';
import { PoleEmploiOidcAuthenticationService } from './pole-emploi-oidc-authentication-service.js';
import { ProSanteConnectOidcAuthenticationService } from './pro-sante-connect-oidc-authentication.service.js';

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
