import { InvalidIdentityProviderError } from '../../../shared/domain/errors.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import { oidcProviderRepository } from '../../infrastructure/repositories/oidc-provider-repository.js';
import { FwbOidcAuthenticationService } from './fwb-oidc-authentication-service.js';
import { OidcAuthenticationService } from './oidc-authentication-service.js';
import { PoleEmploiOidcAuthenticationService } from './pole-emploi-oidc-authentication-service.js';

export class OidcAuthenticationServiceRegistry {
  #allOidcProviderServices = null;
  #oidcProviderServicesByRequestedApplication = {};
  #readyOidcProviderServicesByIdentityProviderCode = {};

  constructor(dependencies = {}) {
    this.oidcProviderRepository = dependencies.oidcProviderRepository ?? oidcProviderRepository;
  }

  /**
   * Returns all the OidcAuthenticationServices, enabled or not.
   *
   * @returns {OidcAuthenticationService[]|null}
   */
  async getAllOidcProviderServices() {
    await this.#loadAllOidcProviderServices();

    return this.#allOidcProviderServices;
  }

  /**
   * Returns the enabled OidcAuthenticationServices for the given requestedApplication.
   *
   * @returns {OidcAuthenticationService[]|null}
   */
  async getOidcProviderServicesByRequestedApplication(requestedApplication) {
    await this.#loadAllOidcProviderServices();

    const key = generateGroupByKeyForRequestedApplication(
      requestedApplication.applicationName,
      requestedApplication.applicationTld,
    );
    return this.#oidcProviderServicesByRequestedApplication[key] || [];
  }

  /**
   * Returns the configured OidcAuthenticationService for a given code and requestedApplication.
   *
   * @returns {OidcAuthenticationService}
   * @throws {InvalidArgumentException} if oidcProviderService.initializeClientConfig() throws an error
   */
  async getOidcProviderServiceByCode({ identityProviderCode, requestedApplication }) {
    await this.#loadAllOidcProviderServices();

    const key = generateGroupByKeyForIdentityProviderCode(
      identityProviderCode,
      requestedApplication.applicationName,
      requestedApplication.applicationTld,
    );
    let oidcProviderService = this.#readyOidcProviderServicesByIdentityProviderCode[key];
    if (oidcProviderService) {
      return oidcProviderService;
    }

    const oidcProviderServices = await this.getOidcProviderServicesByRequestedApplication(requestedApplication);
    oidcProviderService = oidcProviderServices.find((service) => identityProviderCode === service.code);
    if (!oidcProviderService) {
      throw new InvalidIdentityProviderError(identityProviderCode);
    }

    await oidcProviderService.initializeClientConfig();
    this.#readyOidcProviderServicesByIdentityProviderCode[key] = oidcProviderService;

    return oidcProviderService;
  }

  async testOnly_reset(oidcProviderServices) {
    this.#allOidcProviderServices = null;
    this.#oidcProviderServicesByRequestedApplication = {};
    this.#readyOidcProviderServicesByIdentityProviderCode = {};

    if (oidcProviderServices) {
      await this.#loadAllOidcProviderServices(oidcProviderServices);
    }
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

    this.#oidcProviderServicesByRequestedApplication = Object.groupBy(
      enabledOidcProviderServices,
      (oidcProviderService) =>
        generateGroupByKeyForRequestedApplication(oidcProviderService.application, oidcProviderService.applicationTld),
    );
  }
}

function generateGroupByKeyForRequestedApplication(application, applicationTld) {
  return application + applicationTld;
}

function generateGroupByKeyForIdentityProviderCode(identityProviderCode, application, applicationTld) {
  return `${identityProviderCode}-${application}${applicationTld}`;
}
