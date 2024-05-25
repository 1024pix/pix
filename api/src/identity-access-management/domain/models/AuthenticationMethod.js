import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);
import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { POLE_EMPLOI } from '../constants/oidc-identity-providers.js';

class PixAuthenticationComplement {
  constructor({ password, shouldChangePassword } = {}) {
    this.password = password;
    this.shouldChangePassword = shouldChangePassword;

    validateEntity(
      Joi.object({
        password: Joi.string().required(),
        shouldChangePassword: Joi.boolean().required(),
      }),
      this,
    );
  }
}

class OidcAuthenticationComplement {
  constructor(properties) {
    validateEntity(Joi.object().required().min(1), properties);

    Object.entries(properties).forEach(([key, value]) => {
      this[key] = value;
    });
  }
}

class PoleEmploiOidcAuthenticationComplement extends OidcAuthenticationComplement {
  constructor({ accessToken, refreshToken, expiredDate } = {}) {
    super({ accessToken, refreshToken, expiredDate });

    validateEntity(
      Joi.object({
        accessToken: Joi.string().required(),
        refreshToken: Joi.string().optional(),
        expiredDate: Joi.date().required(),
      }),
      this,
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
      this,
    );
  }
}

const validationSchema = Joi.object({
  id: Joi.number().optional(),
  identityProvider: Joi.string().required(),
  authenticationComplement: Joi.when('identityProvider', {
    switch: [
      { is: NON_OIDC_IDENTITY_PROVIDERS.PIX.code, then: Joi.object().instance(PixAuthenticationComplement).required() },
      { is: POLE_EMPLOI.code, then: Joi.object().instance(PoleEmploiOidcAuthenticationComplement).required() },
      { is: NON_OIDC_IDENTITY_PROVIDERS.GAR.code, then: Joi.any().empty() },
    ],
    otherwise: Joi.object().instance(OidcAuthenticationComplement).allow(null),
  }),
  externalIdentifier: Joi.when('identityProvider', {
    is: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    then: Joi.any().forbidden(),
    otherwise: Joi.string().required(),
  }),

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
      identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
      authenticationComplement,
      externalIdentifier: undefined,
      createdAt,
      updatedAt,
      userId,
    });
  }
}

AuthenticationMethod.PixAuthenticationComplement = PixAuthenticationComplement;
AuthenticationMethod.OidcAuthenticationComplement = OidcAuthenticationComplement;
AuthenticationMethod.PoleEmploiOidcAuthenticationComplement = PoleEmploiOidcAuthenticationComplement;
AuthenticationMethod.GARAuthenticationComplement = GARAuthenticationComplement;

export { AuthenticationMethod };
