const Joi = require('joi').extend(require('@joi/date'));
const { validateEntity } = require('../validators/entity-validator');
const { ROLES } = require('../constants').PIX_ADMIN;

module.exports = class AdminMember {
  constructor({ id, userId, firstName, lastName, email, role, createdAt, updatedAt, disabledAt }) {
    this.id = id;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.disabledAt = disabledAt;

    validateEntity(
      Joi.object({
        id: Joi.number().integer().required(),
        userId: Joi.number().optional(),
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        email: Joi.string().email().optional(),
        role: Joi.string().valid(ROLES.SUPER_ADMIN, ROLES.SUPPORT, ROLES.METIER, ROLES.CERTIF).required(),
        createdAt: Joi.date().allow(null).optional(),
        updatedAt: Joi.date().allow(null).optional(),
        disabledAt: Joi.date().allow(null).optional(),
      }),
      this
    );
  }

  get isSuperAdmin() {
    return this.role === ROLES.SUPER_ADMIN;
  }
};
