const Joi = require('joi');
const { EntityValidationError } = require('../errors.js');
const Organization = require('../models/Organization.js');
const Membership = require('../models/Membership.js');
const OidcIdentityProviders = require('../../../lib/domain/constants/oidc-identity-providers.js');

const validProviders = Object.values(OidcIdentityProviders).map((provider) => provider.service.code);

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
  tags: Joi.string().required().messages({
    'string.empty': 'Les tags ne sont pas renseignés.',
  }),
  locale: Joi.string().required().valid('fr-fr', 'fr', 'en').default('fr-fr').messages({
    'string.empty': "La locale n'est pas renseignée.",
    'any.only': "La locale doit avoir l'une des valeurs suivantes : fr-fr, fr ou en",
  }),
  identityProviderForCampaigns: Joi.string()
    .allow(null)
    .valid('GAR', ...validProviders)
    .messages({
      'any.only': `L'organisme fourni doit avoir l'une des valeurs suivantes : GAR,${validProviders}`,
    }),
  provinceCode: Joi.string().required().allow('', null),
  credit: Joi.number().required().messages({
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

module.exports = {
  validate(organization) {
    const { error } = schema.validate(organization, { abortEarly: false, allowUnknown: true });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
    return true;
  },
};
