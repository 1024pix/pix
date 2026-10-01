import { featureToggles } from '../../shared/infrastructure/feature-toggles/index.js';
import { ltiRoute } from './lti.route.js';

async function register(server, options, dependencies = { featureToggles }) {
  const isLtiEnabled = await dependencies.featureToggles.get('isLtiEnabled');

  if (!isLtiEnabled) {
    return;
  }

  server.route(ltiRoute);
}

const name = 'lti/lti-api';

export const ltiRoutes = [{ register, name }];
