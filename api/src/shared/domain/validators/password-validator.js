import Joi from 'joi';

import { EntityValidationError } from '../errors.js';

const pattern = /^(?=.*\p{Lu})(?=.*\p{Ll})(?=.*\d).{8,}$/v;

/** @type {Joi.StringSchema<string>} */
export const PasswordSchema = Joi.string().pattern(pattern);

const PasswordWithMessagesSchema = Joi.object({
  password: PasswordSchema.required().max(255).messages({
    'string.empty': 'Votre mot de passe n’est pas renseigné.',
    'string.pattern.base':
      'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.',
    'string.max': 'Votre mot de passe ne doit pas dépasser les 255 caractères.',
    'any.required': 'Votre mot de passe n’est pas renseigné.',
  }),
});

/**
 * Validates a password against the password policy.
 *
 * @param {string} password - The password to validate.
 * @returns {true} Returns `true` when the password is valid.
 * @throws {EntityValidationError} When the password fails validation.
 */
export function validate(password) {
  const { error } = PasswordWithMessagesSchema.validate({ password });
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
  return true;
}
