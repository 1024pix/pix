const Joi = require('joi');
const campaignParticipationResultController = require('./campaign-participation-result-controller');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function(server) {
  server.route([
    /**
     * @deprecated
     * Route in no longer maintained
     * Use instead GET /api/users/{userId}/campaigns/{campaignId}/assessment-result
     */
    {
      method: 'GET',
      path: '/api/campaign-participations/{id}/campaign-participation-result',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.campaignParticipationId,
          }),
        },
        handler: campaignParticipationResultController.get,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération du résultat d\'une participation à une campagne',
        ],
        tags: ['api', 'campaign-participation-result'],
      },
    },
  ]);
};

exports.name = 'campaign-participation-result-api';
