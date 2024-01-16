import { flashAssessmentConfigurationController } from './flash-assessment-configuration-controller.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';

const register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/flash-assessment-configuration',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: flashAssessmentConfigurationController.getActiveFlashAssessmentConfiguration,
        tags: ['api', 'flash-assessment-configuration'],
        notes: [
          '**Cette route est restreinte aux super-administrateurs** \n' +
            'Récupère la configuration active pour la certification v3',
        ],
      },
    },
  ]);
};

const name = 'flash-assessment-configuration';

export { register, name };
