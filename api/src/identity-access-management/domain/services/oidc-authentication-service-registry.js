import { InvalidIdentityProviderError } from '../../../shared/domain/errors.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import { oidcProviderRepository } from '../../infrastructure/repositories/oidc-provider-repository.js';
import { FwbOidcAuthenticationService } from './fwb-oidc-authentication-service.js';
import { OidcAuthenticationService } from './oidc-authentication-service.js';
import { PoleEmploiOidcAuthenticationService } from './pole-emploi-oidc-authentication-service.js';

export class OidcAuthenticationServiceRegistry {
  #allOidcProviderServices = null;
  #readyOidcProviderServicesByRequestedApplications = {};

  constructor(dependencies = {}) {
    this.oidcProviderRepository = dependencies.oidcProviderRepository ?? oidcProviderRepository;
  }

  /**
   * @return {OidcAuthenticationService[]|null}
   */
  async getAllOidcProviderServices() {
    await this.#loadAllOidcProviderServices();

    return this.#allOidcProviderServices;
  }

  async getReadyOidcProviderServicesByRequestedApplication(requestedApplication) {
    await this.#loadAllOidcProviderServices();

    const groupByKey = generateGroupByKey(requestedApplication.applicationName, requestedApplication.applicationTld);
    return this.#readyOidcProviderServicesByRequestedApplications[groupByKey] || [];
  }

  async getOidcProviderServiceByCode({ identityProviderCode, requestedApplication }) {
    await this.#loadAllOidcProviderServices();

    await this.#configureReadyOidcProviderServiceByCode(identityProviderCode);

    const oidcProviderServices = await this.getReadyOidcProviderServicesByRequestedApplication(requestedApplication);
    const oidcProviderService = oidcProviderServices.find((service) => identityProviderCode === service.code);

    if (!oidcProviderService) {
      throw new InvalidIdentityProviderError(identityProviderCode);
    }

    return oidcProviderService;
  }

  async testOnly_reset(oidcProviderServices) {
    this.#allOidcProviderServices = null;
    this.#readyOidcProviderServicesByRequestedApplications = {};

    if (oidcProviderServices) {
      await this.#loadAllOidcProviderServices(oidcProviderServices);
    }
  }

  async #configureReadyOidcProviderServiceByCode(oidcProviderServiceCode) {
    const oidcProviderService = this.#allOidcProviderServices?.find(
      (oidcProviderService) => oidcProviderService.code === oidcProviderServiceCode,
    );

    if (!oidcProviderService) return;

    await oidcProviderService.initializeClientConfig();
  }

  async #loadAllOidcProviderServices(oidcProviderServices) {
    if (this.#allOidcProviderServices) {
      return;
    }

    if (!oidcProviderServices) {
      const oidcProviders = await this.oidcProviderRepository.findAllOidcProviders();

      oidcProviderServices = await PromiseUtils.mapSeries(oidcProviders, async (oidcProvider) => {
        await oidcProvider.decryptClientSecret(cryptoService);
        switch (oidcProvider.identityProvider) {
          case 'FWB':
            return new FwbOidcAuthenticationService(oidcProvider);
          case 'POLE_EMPLOI':
            return new PoleEmploiOidcAuthenticationService(oidcProvider);
          default:
            return new OidcAuthenticationService(oidcProvider);
        }
      });
    }

    this.#allOidcProviderServices = oidcProviderServices;

    const enabledOidcProviderServices = this.#allOidcProviderServices.filter(
      (oidcProviderService) => oidcProviderService.isEnabled,
    );

    this.#readyOidcProviderServicesByRequestedApplications = Object.groupBy(
      enabledOidcProviderServices,
      (oidcProviderService) => generateGroupByKey(oidcProviderService.application, oidcProviderService.applicationTld),
    );
  }
}

function generateGroupByKey(application, applicationTld) {
  return application + applicationTld;
}
