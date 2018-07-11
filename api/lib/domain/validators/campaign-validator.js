const Joi = require('joi');
const { EntityValidationError } = require('../errors');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const campaignValidationJoiSchema = Joi.object().keys({

  name: Joi.string().required().error(() => {
    return { message: 'Le nom n’est pas renseigné.' };
  }),

  creatorId: Joi.number().integer().required().error(() => {
    return { message: 'Le créateur n’est pas renseigné.' };
  }),

});

module.exports = {

  validate(campaign) {

    const joiValidationResults = Joi.validate(campaign, campaignValidationJoiSchema, validationConfiguration);
    if(joiValidationResults.error === null) {
      return Promise.resolve();
    } else {
      return Promise.reject(EntityValidationError.fromJoiErrors(joiValidationResults.error.details));
    }
  }

};
