const _ = require('lodash');
const Joi = require('joi');

const JOI_VALIDATION_ERROR = 'ValidationError';
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

  email: Joi.string().email().required().error((errors) => {
    const error = errors[0];
    if (error.type === 'any.empty') {
      return { message: 'L’adresse électronique n’est pas renseignée.' };
    }
    return { message: 'L’adresse électronique n’est pas correcte.' };
  })
});

function _formatJoiValidationError(joiError) {
  return {
    source: {
      pointer: `/data/attributes/${_.kebabCase(joiError.context.key)}`
    },
    title: `Invalid organization data attribute "${joiError.context.key}"`,
    detail: joiError.message,
    meta: {
      field: joiError.context.key
    }
  };
}

module.exports = {

  validate(organization) {
    return Joi.validate(organization, organizationValidationJoiSchema, validationConfiguration).catch(error => {
      if (error.name === JOI_VALIDATION_ERROR) {
        return Promise.reject(error.details.map(_formatJoiValidationError));
      }
      throw error;
    });
  }

};
