import Joi from 'joi';
import { udpdateCpfImportStatusController } from './update-cpf-import-status-controller.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';

const register = async function (server) {
  server.route([
    {
      method: 'PUT',
      path: '/api/admin/cpf/receipts',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        response: {
          status: {
            200: Joi.object({}),
          },
        },
        handler: udpdateCpfImportStatusController.updateFromReceipts,
        tags: ['api', 'cpf'],
        description: 'Integration des accusés de traitement CPF',
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Elle permet de traiter les accusés de traitement générés par le compte-personnel-formation. \n' +
            "- Les fichiers traités proviennent d'un stockage externe sur lequel les reçus sont déposés. \n" +
            "- La lecture du reçu donne lieu à la mise à jour du statut de l'import CPF en base.",
        ],
        plugins: {
          'hapi-swagger': {
            produces: ['application/json'],
          },
        },
      },
    },
  ]);
};

const name = 'update-cpf-import-status-api';
export { register, name };
