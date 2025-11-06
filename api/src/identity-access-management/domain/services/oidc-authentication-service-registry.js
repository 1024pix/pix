import { InvalidIdentityProviderError } from '../../../shared/domain/errors.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { oidcProviderRepository } from '../../infrastructure/repositories/oidc-provider-repository.js';
import { FwbOidcAuthenticationService } from './fwb-oidc-authentication-service.js';
import { OidcAuthenticationService } from './oidc-authentication-service.js';
import { PoleEmploiOidcAuthenticationService } from './pole-emploi-oidc-authentication-service.js';

export class OidcAuthenticationServiceRegistry {
  #allOidcProviderServices = null;
  #readyOidcProviderServicesForPixAdmin = null;
  #readyOidcProviderServicesByRequestedApplications = {};

  constructor(dependencies = {}) {
    this.oidcProviderRepository = dependencies.oidcProviderRepository;
  }

  async configureReadyOidcProviderServiceByCode(oidcProviderServiceCode) {
    const oidcProviderService = this.#allOidcProviderServices?.find(
      (oidcProviderService) => oidcProviderService.code === oidcProviderServiceCode,
    );

    if (!oidcProviderService) return;

    await oidcProviderService.initializeClientConfig();

    return true;
  }

  /**
   * @return {OidcAuthenticationService[]|null}
   */
  getAllOidcProviderServices() {
    return this.#allOidcProviderServices;
  }

  getReadyOidcProviderServicesForPixAdmin() {
    return this.#readyOidcProviderServicesForPixAdmin;
  }

  getReadyOidcProviderServicesByRequestedApplication(requestedApplication) {
    return this.#readyOidcProviderServicesByRequestedApplications[
      generateGroupByKey(requestedApplication.applicationName, requestedApplication.applicationTld)
    ];
  }

  getOidcProviderServiceByCode({ identityProviderCode, requestedApplication }) {
    const oidcProviderService = this.#readyOidcProviderServicesByRequestedApplications[
      generateGroupByKey(requestedApplication.applicationName, requestedApplication.applicationTld)
    ].find((service) => identityProviderCode === service.code);

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
            case 'POLE_EMPLOI':
              return new PoleEmploiOidcAuthenticationService(oidcProvider);
            default:
              return new OidcAuthenticationService(oidcProvider);
          }
        }),
      );
    }

    this.#allOidcProviderServices = oidcProviderServices;

    this.#readyOidcProviderServicesForPixAdmin = this.#allOidcProviderServices.filter(
      (oidcProviderService) => oidcProviderService.isReadyForPixAdmin,
    );

    this.#readyOidcProviderServicesByRequestedApplications = Object.groupBy(
      this.#allOidcProviderServices.filter(
        (oidcProviderService) => oidcProviderService.isReady || oidcProviderService.isReadyForPixAdmin,
      ),
      (oidcProviderService) => generateGroupByKey(oidcProviderService.application, oidcProviderService.applicationTld),
    );

    return true;
  }

  testOnly_reset() {
    this.#allOidcProviderServices = null;
    this.#readyOidcProviderServicesForPixAdmin = null;
    this.#readyOidcProviderServicesByRequestedApplications = {};
  }
}

function generateGroupByKey(application, applicationTld) {
  return application + applicationTld;
}
