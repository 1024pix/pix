const BaseJoi = require('joi');
const JoiDate = require('@joi/date');
const Joi = BaseJoi.extend(JoiDate);
const { validateEntity } = require('../validators/entity-validator.js');

const identityProviders = {
  PIX: 'PIX',
  GAR: 'GAR',
};

class PixAuthenticationComplement {
  constructor({ password, shouldChangePassword } = {}) {
    this.password = password;
    this.shouldChangePassword = shouldChangePassword;

    validateEntity(
      Joi.object({
        password: Joi.string().required(),
        shouldChangePassword: Joi.boolean().required(),
      }),
      this
    );
  }
}

class OidcAuthenticationComplement {
  constructor({ accessToken, refreshToken, expiredDate } = {}) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiredDate = expiredDate;

    validateEntity(
      Joi.object({
        accessToken: Joi.string().required(),
        refreshToken: Joi.string().optional(),
        expiredDate: Joi.date().required(),
      }),
      this
    );
  }
}

class GARAuthenticationComplement {
  constructor({ firstName, lastName } = {}) {
    this.firstName = firstName;
    this.lastName = lastName;

    validateEntity(
      Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
      }),
      this
    );
  }
}

const validationSchema = Joi.object({
  id: Joi.number().optional(),
  identityProvider: Joi.string()
    .valid(...Object.values(identityProviders), 'POLE_EMPLOI', 'CNAV', 'FWB')
    .required(),
  authenticationComplement: Joi.when('identityProvider', [
    { is: identityProviders.PIX, then: Joi.object().instance(PixAuthenticationComplement).required() },
    { is: 'POLE_EMPLOI', then: Joi.object().instance(OidcAuthenticationComplement).required() },
    { is: identityProviders.GAR, then: Joi.any().empty() },
    { is: 'CNAV', then: Joi.any().empty() },
    { is: 'FWB', then: Joi.any().empty() },
  ]),
  externalIdentifier: Joi.when('identityProvider', [
    { is: identityProviders.GAR, then: Joi.string().required() },
    { is: 'POLE_EMPLOI', then: Joi.string().required() },
    { is: identityProviders.PIX, then: Joi.any().forbidden() },
    { is: 'CNAV', then: Joi.string().required() },
    { is: 'FWB', then: Joi.string().required() },
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

  static buildPixAuthenticationMethod({ id, password, shouldChangePassword = false, createdAt, updatedAt, userId }) {
    const authenticationComplement = new PixAuthenticationComplement({ password, shouldChangePassword });
    return new AuthenticationMethod({
      id,
      identityProvider: identityProviders.PIX,
      authenticationComplement,
      externalIdentifier: undefined,
      createdAt,
      updatedAt,
      userId,
    });
  }
}

AuthenticationMethod.identityProviders = identityProviders;
AuthenticationMethod.PixAuthenticationComplement = PixAuthenticationComplement;
AuthenticationMethod.OidcAuthenticationComplement = OidcAuthenticationComplement;
AuthenticationMethod.GARAuthenticationComplement = GARAuthenticationComplement;
module.exports = AuthenticationMethod;
