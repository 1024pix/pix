const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const { validateEntity } = require('../validators/entity-validator');

const identityProviders = {
  PIX: 'PIX',
  GAR: 'GAR',
  POLE_EMPLOI: 'POLE_EMPLOI',
};

class PasswordAuthenticationMethod {

  constructor({
    password,
    shouldChangePassword,
  } = {}) {
    this.password = password;
    this.shouldChangePassword = shouldChangePassword;

    validateEntity(Joi.object({
      password: Joi.string().required(),
      shouldChangePassword: Joi.boolean().required(),
    }), this);
  }
}

class PoleEmploiAuthenticationComplement {
  constructor({
    accessToken,
    refreshToken,
    expiredDate,
  } = {}) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiredDate = expiredDate;

    validateEntity(Joi.object({
      accessToken: Joi.string().required(),
      refreshToken: Joi.string().optional(),
      expiredDate: Joi.date().required(),
    }), this);
  }
}

const validationSchema = Joi.object({
  id: Joi.number().optional(),
  identityProvider: Joi.string().valid(...Object.values(identityProviders)).required(),
  authenticationComplement: Joi.when('identityProvider', [
    { is: identityProviders.PIX, then: Joi.object().instance(PasswordAuthenticationMethod).required() },
    { is: identityProviders.POLE_EMPLOI, then: Joi.object().instance(PoleEmploiAuthenticationComplement).required() },
    { is: identityProviders.GAR, then: Joi.any().forbidden() },
  ]),
  externalIdentifier: Joi.when('identityProvider', [
    { is: identityProviders.GAR, then: Joi.string().required() },
    { is: identityProviders.POLE_EMPLOI, then: Joi.string().required() },
    { is: identityProviders.PIX, then: Joi.any().forbidden() },
  ]),
  userId: Joi.number().integer().required(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
});

class AuthenticationMethod {

  constructor({
    id,
    identityProvider,
    authenticationComplement,
    externalIdentifier,
    createdAt,
    updatedAt,
    userId,
  } = {}) {
    this.id = id;
    this.identityProvider = identityProvider;
    this.authenticationComplement = authenticationComplement;
    this.externalIdentifier = externalIdentifier;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.userId = userId;

    validateEntity(validationSchema, this);
  }
}

AuthenticationMethod.identityProviders = identityProviders;
AuthenticationMethod.PasswordAuthenticationMethod = PasswordAuthenticationMethod;
AuthenticationMethod.PoleEmploiAuthenticationComplement = PoleEmploiAuthenticationComplement;
module.exports = AuthenticationMethod;
