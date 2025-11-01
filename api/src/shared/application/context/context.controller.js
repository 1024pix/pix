import { usecases } from '../../../identity-access-management/domain/usecases/index.js';
import {
  getForwardedOrigin,
  RequestedApplication,
} from '../../../identity-access-management/infrastructure/utils/network.js';
import { featureToggles } from '../../infrastructure/feature-toggles/index.js';
import * as contextSerializer from '../../infrastructure/serializers/jsonapi/context.serializer.js';
import { logger } from '../../infrastructure/utils/logger.js';

const getContext = async function (request) {
  const featureTogglesList = await featureToggles.withTag('frontend');

  let identityProviders;
  try {
    const origin = getForwardedOrigin(request.headers);
    const requestedApplication = RequestedApplication.fromOrigin(origin);

    identityProviders = await usecases.getReadyIdentityProviders({ requestedApplication });
  } catch (error) {
    logger.error(error, `Error getting identityProviders.`);
    identityProviders = [];
  }

  const context = {
    featureToggles: featureTogglesList,
    identityProviders,
  };
  return contextSerializer.serialize(context);
};

const contextController = { getContext };

export { contextController };
