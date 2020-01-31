const Joi = require('@hapi/joi');
const { EntityValidationError } = require('../errors');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const campaignValidationJoiSchema = Joi.object({

  name: Joi.string()
    .required()
    .messages({
      'string.empty': 'Veuillez donner un nom à votre campagne.',
    }),

  creatorId: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Le créateur n’est pas renseigné.',
    }),

  organizationId: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'L‘organisation n’est pas renseignée.',
    }),

  targetProfileId: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Veuillez sélectionner un profil cible pour votre campagne.',
    }),

  idPixLabel: Joi.string()
    .allow(null)
    .min(3)
    .messages({
      'string.empty': 'Veuillez préciser le libellé du champ qui sera demandé à vos participants au démarrage du parcours.',
      'string.min': 'Veuillez préciser le libellé du champ qui sera demandé à vos participants au démarrage du parcours.',
    }),

});

module.exports = {

  validate(campaign) {
    const { error } = campaignValidationJoiSchema.validate(campaign, validationConfiguration);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
    return true;
  }
};
