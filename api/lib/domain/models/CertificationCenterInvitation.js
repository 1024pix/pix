import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import { validateEntity } from '../validators/entity-validator.js';
import randomString from 'randomstring';

const statuses = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  CANCELLED: 'cancelled',
};

const roles = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  AUTO: null,
};

const validationScheme = Joi.object({
  id: Joi.number().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string()
    .valid(...Object.values(roles))
    .optional(),
  updatedAt: Joi.date().optional(),
  status: Joi.string()
    .valid(...Object.values(statuses))
    .optional(),
  certificationCenterId: Joi.number().optional(),
  certificationCenterName: Joi.string().optional(),
  code: Joi.string().optional(),
});

class CertificationCenterInvitation {
  constructor({ id, email, updatedAt, role, status, certificationCenterId, certificationCenterName, code } = {}) {
    this.id = id;
    this.email = email;
    this.updatedAt = updatedAt;
    this.role = role;
    this.status = status;
    this.certificationCenterId = certificationCenterId;
    this.certificationCenterName = certificationCenterName;
    this.code = code;

    validateEntity(validationScheme, this);
  }

  static create({ email, certificationCenterId, updatedAt = new Date(), code = this.generateCode(), role }) {
    const certificationCenterToCreate = new CertificationCenterInvitation({
      email,
      certificationCenterId,
      status: CertificationCenterInvitation.StatusType.PENDING,
      updatedAt,
      code,
      role,
    });
    delete certificationCenterToCreate.id;
    delete certificationCenterToCreate.certificationCenterName;
    return certificationCenterToCreate;
  }

  static generateCode() {
    return randomString.generate({ length: 10, capitalization: 'uppercase' });
  }

  get isPending() {
    return this.status === statuses.PENDING;
  }

  get isAccepted() {
    return this.status === statuses.ACCEPTED;
  }

  get isCancelled() {
    return this.status === statuses.CANCELLED;
  }
}

CertificationCenterInvitation.StatusType = statuses;
CertificationCenterInvitation.Roles = roles;

export { CertificationCenterInvitation };
