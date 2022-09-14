const Joi = require('joi').extend(require('@joi/date'));
const { validateEntity } = require('../validators/entity-validator');
const isNil = require('lodash/isNil');
const { ROLES } = require('../constants').PIX_ADMIN;

export type AdminMemberOptionsType = {
  id: unknown;
  userId: unknown;
  firstName: unknown;
  lastName: unknown;
  email: unknown;
  role: unknown;
  createdAt: unknown;
  updatedAt: unknown;
  disabledAt: unknown;
}

export class AdminMember {
  id;
  userId;
  firstName;
  lastName;
  email;
  role;
  createdAt;
  updatedAt;
  disabledAt;

  constructor({ id, userId, firstName, lastName, email, role, createdAt, updatedAt, disabledAt }: AdminMemberOptionsType) {
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

  get hasAccessToAdminScope() {
    return this.role in ROLES && isNil(this.disabledAt);
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
};
