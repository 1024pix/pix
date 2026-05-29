import Joi from 'joi';

import { EntityValidationError } from '../../../shared/domain/errors.js';
import { Membership } from '../../../shared/domain/models/Membership.js';
import { getSupportedLocales } from '../../../shared/domain/services/locale-service.js';
import { Organization } from '../models/Organization.js';

const lowerCaseSupportedLocales = getSupportedLocales().map((supportedLocale) => supportedLocale.toLocaleLowerCase());

const schema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(Organization.types))
    .required()
    .messages({
      'string.empty': 'Le type n’est pas renseigné.',
      'any.only': `Le type fourni doit avoir l'une des valeurs suivantes : ${Object.values(Organization.types)}`,
    }),
  externalId: Joi.string().allow(null),
  name: Joi.string().required().messages({
    'string.empty': 'Le nom n’est pas renseigné.',
  }),
  tags: Joi.string().allow('').default(''),
  locale: Joi.string()
    .valid(...lowerCaseSupportedLocales)
    .default('fr-fr')
    .messages({
      'string.empty': "La locale n'est pas renseignée.",
      'any.only': `La locale doit avoir l'une des valeurs suivantes : ${lowerCaseSupportedLocales.join(', ')}`,
    }),
  identityProviderForCampaigns: Joi.string().allow(null),
  provinceCode: Joi.string().allow('', null),
  credit: Joi.number().min(0).allow(null).messages({
    'number.base': 'Le crédit doit être un entier.',
    'number.min': 'Le crédit doit être un nombre entier positif.',
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
  createdBy: Joi.number().empty(null).strict().required().messages({
    'any.required': "L'id du créateur est manquant",
    'number.base': "L'id du créateur n'est pas un nombre",
  }),
  administrationTeamId: Joi.number().empty(null).strict().required().messages({
    'any.required': "L'id de l'équipe en charge est manquant",
    'number.base': "L'id de l'équipe en charge n'est pas un nombre",
  }),
  countryCode: Joi.number().min(99000).max(99999).empty(null).integer().strict().required().messages({
    'any.required': 'Le code pays n’est pas renseigné.',
    'number.base': "Le code pays n'est pas un nombre",
    'number.min': 'Le code pays doit être un nombre entier compris entre 99000 et 99999.',
    'number.max': 'Le code pays doit être un nombre entier compris entre 99000 et 99999.',
  }),
  organizationLearnerTypeId: Joi.number().strict().empty(null).required().messages({
    'any.required': "L'id du public prescrit est manquant",
    'number.base': "L'id du public prescrit n'est pas un nombre",
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
