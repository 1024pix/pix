const Joi = require('@hapi/joi');
const campaignParticipationController = require('./campaign-participation-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/campaign-participations',
      config: {
        handler: campaignParticipationController.find,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des campaign-participation par assessment ou par campagne' +
          '- L\'utilisation de cette route avec  le paramètre campaign-participation-result est dépréciée. Utiliser /api/campaigns/{id}/assessment-participations à la place',
        ],
        tags: ['api', 'campaign-participation']
      }
    },
    {
      method: 'GET',
      path: '/api/campaign-participations/{id}',
      config: {
        handler: campaignParticipationController.getById,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération d\'une campaign-participation par son id',
        ],
        tags: ['api', 'campaign-participation']
      }
    },
    {
      method: 'PATCH',
      path: '/api/campaign-participations/{id}',
      config: {
        handler: campaignParticipationController.shareCampaignResult,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Partage de résultat de la campagne d‘un utilisateur, à son organisation',
        ],
        tags: ['api', 'campaign-participation']
      }
    },
    {
      method: 'POST',
      path: '/api/campaign-participations',
      config: {
        handler: campaignParticipationController.save,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Création d‘une nouvelle participation à une campagne'
        ],
        tags: ['api', 'campaign-participation']
      }
    },
    {
      method: 'PATCH',
      path: '/api/campaign-participations/{id}/begin-improvement',
      config: {
        handler: campaignParticipationController.beginImprovement,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Elle permet de progresser à la fin d\'une participation à une campagne' +
          '- Le contenu de la requête n\'est pas pris en compte.',
        ],
        tags: ['api', 'campaign-participation']
      }
    },
    {
      method: 'GET',
      path: '/api/campaign-participations/{id}/analyses',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required()
          }),
        },
        handler: campaignParticipationController.getAnalysis,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la participation à la campagne',
          '- Récupération de l\'analyse d\'un participant pour la participation à la campagne',
        ],
        tags: ['api', 'campaign-participation']
      }
    },
  ]);
};

exports.name = 'campaign-participations-api';
