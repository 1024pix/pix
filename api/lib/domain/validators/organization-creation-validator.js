const Joi = require('@hapi/joi');
const { EntityValidationError } = require('../errors');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const organizationValidationJoiSchema = Joi.object().keys({

  name: Joi.string().required().error(() => {
    return { message: 'Le nom n’est pas renseigné.' };
  }),

  type: Joi.string().required().valid('SCO', 'SUP', 'PRO').error((errors) => {
    const error = errors[0];
    if (error.type === 'any.empty') {
      return { message: 'Le type n’est pas renseigné.' };
    }
    return { message: 'Le type de l’organisation doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.' };
  }),

});

module.exports = {

  validate(organizationCreationParams) {

    const joiValidationResults = Joi.validate(organizationCreationParams, organizationValidationJoiSchema, validationConfiguration);
    if (joiValidationResults.error === null) {
      return Promise.resolve();
    } else {
      return Promise.reject(EntityValidationError.fromJoiErrors(joiValidationResults.error.details));
    }
  }

};
