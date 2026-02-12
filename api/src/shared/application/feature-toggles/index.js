import ms from 'ms';

import { featureToggleController } from './feature-toggle-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/feature-toggles',
      options: {
        auth: false,
        handler: featureToggleController.getActiveFeatures,
        tags: ['api'],
        cache: {
          expiresIn: ms('5 Minutes'),
          privacy: 'public',
        },
      },
    },
  ]);
};

const name = 'feature-toggles-api';
export { name, register };
