const Joi = require('@hapi/joi');
const { EntityValidationError } = require('../errors');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const campaignValidationJoiSchema = Joi.object().keys({

  name: Joi.string().required().error(() => {
    return { message: 'Veuillez donner un nom à votre campagne.' };
  }),

  creatorId: Joi.number().integer().required().error(() => {
    return { message: 'Le créateur n’est pas renseigné.' };
  }),

  organizationId: Joi.number().integer().required().error(() => {
    return { message: 'L‘organisation n’est pas renseignée.' };
  }),

  targetProfileId: Joi.number().integer().required().error(() => {
    return { message: 'Veuillez sélectionner un profil cible pour votre campagne.' };
  }),

  idPixLabel: Joi.string().allow(null).min(3).error(() => {
    return { message: 'Veuillez préciser le libellé du champ qui sera demandé à vos participants au démarrage du parcours.' };
  })

});

module.exports = {

  validate(campaign) {

    const joiValidationResults = Joi.validate(campaign, campaignValidationJoiSchema, validationConfiguration);
    if (joiValidationResults.error === null) {
      return Promise.resolve();
    } else {
      return Promise.reject(EntityValidationError.fromJoiErrors(joiValidationResults.error.details));
    }
  }

};
