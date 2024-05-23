import Joi from 'joi';

import { Organization } from '../../../src/organizational-entities/domain/models/Organization.js';
import { SUPPORTED_LOCALES } from '../../../src/shared/domain/constants.js';
import { EntityValidationError } from '../../../src/shared/domain/errors.js';
import { Membership } from '../models/Membership.js';

const supportedLocales = SUPPORTED_LOCALES.map((supportedLocale) => supportedLocale.toLocaleLowerCase());

const schema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(Organization.types))
    .required()
    .messages({
      'string.empty': 'Le type n’est pas renseigné.',
      'any.only': `Le type fourni doit avoir l'une des valeurs suivantes : ${Object.values(Organization.types)}`,
    }),
  externalId: Joi.string().required().messages({
    'string.empty': "L'externalId n’est pas renseigné.",
  }),
  name: Joi.string().required().messages({
    'string.empty': 'Le nom n’est pas renseigné.',
  }),
  tags: Joi.string().allow('').default(''),
  locale: Joi.string()
    .valid(...supportedLocales)
    .default('fr-fr')
    .messages({
      'string.empty': "La locale n'est pas renseignée.",
      'any.only': `La locale doit avoir l'une des valeurs suivantes : ${supportedLocales.join(', ')}`,
    }),
  identityProviderForCampaigns: Joi.string().allow(null),
  provinceCode: Joi.string().allow('', null),
  credit: Joi.number().default(0).messages({
    'number.base': 'Le crédit doit être un entier.',
  }),
  emailInvitations: Joi.string().email().allow('', null).messages({
    'string.email': "L'email fourni n'est pas valide.",
  }),
  emailForSCOActivation: Joi.string().email().allow('', null).messages({
    'string.email': "L'email fourni n'est pas valide.",
  }),
  DPOEmail: Joi.string().email().allow('', null).messages({
    'string.email': "L'email fourni n'est pas valide.",
  }),
  organizationInvitationRole: Joi.string()
    .allow('', null)
    .valid(Membership.roles.ADMIN, Membership.roles.MEMBER)
    .messages({
      'any.only': "Le rôle fourni doit avoir l'une des valeurs suivantes : ADMIN ou MEMBER",
    }),
  createdBy: Joi.number().empty('').required().messages({
    'any.required': "L'id du créateur est manquant",
    'number.base': "L'id du créateur n'est pas un nombre",
  }),
});

const validate = function (organization) {
  const { error } = schema.validate(organization, { abortEarly: false, allowUnknown: true });
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
  return true;
};

export { validate };
