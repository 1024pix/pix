const Joi = require('joi');
const { EntityValidationError } = require('../errors');
const Membership = require('../models/Membership');

const schema = Joi.object({
  externalId: Joi.string().required().messages({
    'string.empty': "L'externalId n’est pas renseigné.",
  }),
  name: Joi.string().required().messages({
    'string.empty': 'Le nom n’est pas renseigné.',
  }),
  tags: Joi.string().required().messages({
    'string.empty': 'Les tags ne sont pas renseignés.',
  }),
  documentationUrl: Joi.string().uri().required().messages({
    'string.empty': "L'url de documentation n'est pas renseignée.",
  }),
  locale: Joi.string().required().valid('fr-fr', 'fr', 'en').default('fr-fr').messages({
    'string.empty': "La locale n'est pas renseignée.",
    'any.only': "La locale doit avoir l'une des valeurs suivantes : fr-fr, fr ou en",
  }),
  provinceCode: Joi.string().required().allow('', null),
  credit: Joi.number().required().messages({
    'number.base': "Le crédit n'est pas renseigné.",
  }),
  email: Joi.string().email().required().messages({
    'string.empty': "L'email n’est pas renseigné.",
    'string.email': "L'email fourni n'est pas valide.",
  }),
  organizationInvitationRole: Joi.string().valid(Membership.roles.ADMIN, Membership.roles.MEMBER).required().messages({
    'string.empty': 'Le rôle n’est pas renseigné.',
    'any.only': "Le rôle fourni doit avoir l'une des valeurs suivantes : ADMIN ou MEMBER",
  }),
  createdBy: Joi.number().required().messages({
    'number.base': "L'id du créateur doit être un nombre",
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
