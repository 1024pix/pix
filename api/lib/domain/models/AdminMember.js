import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import { validateEntity } from '../validators/entity-validator.js';
import lodash from 'lodash';
import { PIX_ADMIN } from '../../../src/access/authorization/domain/constants.js';

const { isNil } = lodash;

const { ROLES } = PIX_ADMIN;

class AdminMember {
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
      this,
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
}

export { AdminMember };
