const { ROLES } = require('../../constants').PIX_ADMIN;
const Joi = require('joi').extend(require('@joi/date'));
const isNil = require('lodash/isNil');
const { ObjectValidationError } = require('../../errors');
const schema = Joi.object({
  role: Joi.string().valid(ROLES.SUPER_ADMIN, ROLES.SUPPORT, ROLES.METIER, ROLES.CERTIF).required(),
});

class User {
  constructor({ id, userId, firstName, lastName, role, email, disabledAt }) {
    this.id = id;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.role = role;
    this.disabledAt = disabledAt;
  }

  addAdminRole(role) {
    this.role = role;
    this.disabledAt = null;
    this._validate();
  }

  _validate() {
    const { error } = schema.validate({ role: this.role });
    if (error) {
      throw new ObjectValidationError(error);
    }
  }

  get isSuperAdmin() {
    return this.role === ROLES.SUPER_ADMIN && isNil(this.disabledAt);
  }

  get isCertif() {
    return this.role === ROLES.CERTIF && isNil(this.disabledAt);
  }

  get isMetier() {
    return this.role === ROLES.METIER && isNil(this.disabledAt);
  }

  get isSupport() {
    return this.role === ROLES.SUPPORT && isNil(this.disabledAt);
  }
}

module.exports = User;
