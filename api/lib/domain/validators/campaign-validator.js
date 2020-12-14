const Joi = require('@hapi/joi');
const { first } = require('lodash');
const { EntityValidationError } = require('../errors');
const Campaign = require('../models/Campaign');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const campaignValidationJoiSchema = Joi.object({

  name: Joi.string()
    .required()
    .messages({
      'string.base': 'Veuillez donner un nom à votre campagne.',
      'string.empty': 'Veuillez donner un nom à votre campagne.',
    }),

  type: Joi.string()
    .valid(Campaign.types.ASSESSMENT, Campaign.types.PROFILES_COLLECTION)
    .required()
    .error((errors) => first(errors))
    .messages({
      'any.required': 'Veuillez choisir l’objectif de votre campagne : Évaluation ou Collecte de profils.',
      'string.base': 'Veuillez choisir l’objectif de votre campagne : Évaluation ou Collecte de profils.',
      'any.only': 'Veuillez choisir l’objectif de votre campagne : Évaluation ou Collecte de profils.',
    }),

  creatorId: Joi.number()
    .integer()
    .required()
    .messages({
      'any.required': 'Le créateur n’est pas renseigné.',
      'number.base': 'Le créateur n’est pas renseigné.',
    }),

  organizationId: Joi.number()
    .integer()
    .required()
    .messages({
      'any.required': 'L‘organisation n’est pas renseignée.',
      'number.base': 'L‘organisation n’est pas renseignée.',
    }),

  targetProfileId: Joi.number()
    .when('$type', {
      switch: [{
        is: Joi.string().required().valid(Campaign.types.PROFILES_COLLECTION),
        then: Joi.valid(null).optional(),
      }, {
        is: Joi.string().required().valid(Campaign.types.ASSESSMENT),
        then: Joi.required(),
      }],
      otherwise: Joi.number().allow(null).optional(),
    })
    .integer()
    .messages({
      'any.required': 'Veuillez sélectionner un profil cible pour votre campagne.',
      'number.base': 'Veuillez sélectionner un profil cible pour votre campagne.',
      'any.only': 'Un profil cible n’est pas autorisé pour les campagnes de collecte de profils.',
    }),

  idPixLabel: Joi.string()
    .allow(null)
    .min(3)
    .messages({
      'string.empty': 'Veuillez préciser le libellé du champ qui sera demandé à vos participants au démarrage du parcours.',
      'string.min': 'Veuillez préciser le libellé du champ qui sera demandé à vos participants au démarrage du parcours.',
    }),

  title: Joi.string()
    .allow(null)
    .when('$type', {
      is: Joi.string().required().valid(Campaign.types.PROFILES_COLLECTION),
      then: Joi.valid(null),
      otherwise: Joi.optional(),
    })
    .messages({
      'any.only': 'Le titre du parcours n’est pas autorisé pour les campagnes de collecte de profils.',
    }),

});

module.exports = {

  validate(campaign) {
    const { error } = campaignValidationJoiSchema.validate(campaign, {
      ...validationConfiguration,
      context: { type: campaign.type },
    });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
    return true;
  },
};
