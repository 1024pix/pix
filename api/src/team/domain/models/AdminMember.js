import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { PIX_ADMIN } from '../../../shared/constants.js';
import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';

const { ROLES } = PIX_ADMIN;

export class AdminMember {
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
        email: Joi.string().email().optional().allow(null),
        role: Joi.string().valid(ROLES.SUPER_ADMIN, ROLES.SUPPORT, ROLES.METIER, ROLES.CERTIF).required(),
        createdAt: Joi.date().allow(null).optional(),
        updatedAt: Joi.date().allow(null).optional(),
        disabledAt: Joi.date().allow(null).optional(),
      }),
      this,
    );
  }

  get hasAccessToAdminScope() {
    return this.role in ROLES && this.disabledAt == null;
  }

  get isSuperAdmin() {
    return this.role === ROLES.SUPER_ADMIN && this.disabledAt == null;
  }

  get isCertif() {
    return this.role === ROLES.CERTIF && this.disabledAt == null;
  }

  get isMetier() {
    return this.role === ROLES.METIER && this.disabledAt == null;
  }

  get isSupport() {
    return this.role === ROLES.SUPPORT && this.disabledAt == null;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
