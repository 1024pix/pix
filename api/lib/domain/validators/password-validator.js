import Joi from 'joi';
import XRegExp from 'xregexp';

import { config } from '../../config.js';

const { passwordValidationPattern } = config.account;

import { EntityValidationError } from '../errors.js';

const pattern = XRegExp(passwordValidationPattern);

const passwordValidationJoiSchema = Joi.object({
  password: Joi.string().pattern(pattern).required().max(255).messages({
    'string.empty': 'Votre mot de passe n’est pas renseigné.',
    'string.pattern.base':
      'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.',
    'string.max': 'Votre mot de passe ne doit pas dépasser les 255 caractères.',
    'any.required': 'Votre mot de passe n’est pas renseigné.',
  }),
});

const validate = function (password) {
  const { error } = passwordValidationJoiSchema.validate({ password });
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
  return true;
};

export { validate };
