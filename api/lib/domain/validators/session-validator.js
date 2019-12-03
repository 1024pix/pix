const Joi = require('@hapi/joi');
const { EntityValidationError } = require('../errors');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const sessionValidationJoiSchema = Joi.object().keys({

  address: Joi.string().required().error(() => {
    return { message: 'Veuillez donner un nom de site.' };
  }),

  room: Joi.string().required().error(() => {
    return { message: 'Veuillez donner un nom de salle.' };
  }),

  date: Joi.string().isoDate().required().error(() => {
    return { message: 'Veuillez indiquer une date de début.' };
  }),

  time: Joi.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).required().error(() => {
    return { message: 'Veuillez indiquer une heure de début.' };
  }),

  examiner: Joi.string().required().error(() => {
    return { message: 'Veuillez indiquer un(e) surveillant(e).' };
  }),
});

module.exports = {

  validate(session) {
    const joiValidationResults = Joi.validate(session, sessionValidationJoiSchema, validationConfiguration);

    if (joiValidationResults.error !== null) {
      throw EntityValidationError.fromJoiErrors(joiValidationResults.error.details);
    }
  }
};
