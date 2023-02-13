const Joi = require('joi');
const { statuses } = require('../models/Session');
const { types } = require('../models/CertificationCenter');

const { EntityValidationError } = require('../errors');
const identifiersType = require('../../domain/types/identifiers-type');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const sessionValidationJoiSchema = Joi.object({
  address: Joi.string().required().messages({
    'string.base': 'Veuillez indiquer un nom de site.',
    'string.empty': 'Veuillez indiquer un nom de site.',
  }),

  room: Joi.string().required().messages({
    'string.base': 'Veuillez indiquer un nom de salle.',
    'string.empty': 'Veuillez indiquer un nom de salle.',
  }),

  date: Joi.string().isoDate().required().messages({
    'string.isoDate': 'Veuillez indiquer une date de début au format JJ/MM/AAA.',
    'string.empty': 'Veuillez indiquer une date de début.',
  }),

  time: Joi.string()
    .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.base': 'Veuillez indiquer une heure de début.',
      'string.empty': 'Veuillez indiquer une heure de début.',
      'string.pattern.base': 'Veuillez indiquer une heure de début au format HH:MM.',
    }),

  examiner: Joi.string().required().messages({
    'string.base': 'Veuillez indiquer un(e) surveillant(e).',
    'string.empty': 'Veuillez indiquer un(e) surveillant(e).',
  }),
});

const sessionFiltersValidationSchema = Joi.object({
  id: identifiersType.sessionId.optional(),
  status: Joi.string()
    .trim()
    .valid(statuses.CREATED, statuses.FINALIZED, statuses.IN_PROCESS, statuses.PROCESSED)
    .optional(),
  resultsSentToPrescriberAt: Joi.boolean().optional(),
  certificationCenterName: Joi.string().trim().optional(),
  certificationCenterExternalId: Joi.string().trim().optional(),
  certificationCenterType: Joi.string().trim().valid(types.SUP, types.SCO, types.PRO).optional(),
});

module.exports = {
  validate(session) {
    const { error } = sessionValidationJoiSchema.validate(session, validationConfiguration);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  },

  validateForMassSessionImport(session) {
    const { error } = sessionValidationJoiSchema.validate(session, validationConfiguration);
    if (error) {
      return error.details.map(({ message }) => message);
    }
  },

  validateAndNormalizeFilters(filters) {
    const { value, error } = sessionFiltersValidationSchema.validate(filters, { abortEarly: true });

    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }

    return value;
  },
};
