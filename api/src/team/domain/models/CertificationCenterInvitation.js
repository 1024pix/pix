import JoiDate from '@joi/date';
import BaseJoi from 'joi';

import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';
import { generateCode as generateCodeService } from '../../../shared/infrastructure/utils/code-generator.js';

const Joi = BaseJoi.extend(JoiDate);

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
  locale: Joi.string().optional(),
  updatedAt: Joi.date().optional(),
  status: Joi.string()
    .valid(...Object.values(statuses))
    .optional(),
  certificationCenterId: Joi.number().optional(),
  certificationCenterName: Joi.string().optional(),
  code: Joi.string().optional(),
});

export class CertificationCenterInvitation {
  constructor({
    id,
    email,
    updatedAt,
    role,
    locale,
    status,
    certificationCenterId,
    certificationCenterName,
    code,
  } = {}) {
    this.id = id;
    this.email = email;
    this.updatedAt = updatedAt;
    this.role = role;
    this.locale = locale;
    this.status = status;
    this.certificationCenterId = certificationCenterId;
    this.certificationCenterName = certificationCenterName;
    this.code = code;

    validateEntity(validationScheme, this);
  }

  static create({ email, certificationCenterId, updatedAt = new Date(), code = this.generateCode(), role, locale }) {
    const certificationCenterToCreate = new CertificationCenterInvitation({
      email,
      certificationCenterId,
      status: CertificationCenterInvitation.StatusType.PENDING,
      updatedAt,
      code,
      role,
      locale,
    });
    delete certificationCenterToCreate.id;
    delete certificationCenterToCreate.certificationCenterName;
    return certificationCenterToCreate;
  }

  static generateCode(dependencies = { generateCodeService }) {
    return dependencies.generateCodeService(10, 'alphanumeric').toUpperCase();
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
