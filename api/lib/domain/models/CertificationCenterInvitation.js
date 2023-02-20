const Joi = require('joi').extend(require('@joi/date'));
import { validateEntity } from '../validators/entity-validator';
import randomString from 'randomstring';

const statuses = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  CANCELLED: 'cancelled',
};

const validationScheme = Joi.object({
  id: Joi.number().optional(),
  email: Joi.string().email().optional(),
  updatedAt: Joi.date().optional(),
  status: Joi.string()
    .valid(...Object.values(statuses))
    .optional(),
  certificationCenterId: Joi.number().optional(),
  certificationCenterName: Joi.string().optional(),
  code: Joi.string().optional(),
});

class CertificationCenterInvitation {
  constructor({ id, email, updatedAt, status, certificationCenterId, certificationCenterName, code } = {}) {
    this.id = id;
    this.email = email;
    this.updatedAt = updatedAt;
    this.status = status;
    this.certificationCenterId = certificationCenterId;
    this.certificationCenterName = certificationCenterName;
    this.code = code;

    validateEntity(validationScheme, this);
  }

  static create({ email, certificationCenterId, updatedAt = new Date(), code = this.generateCode() }) {
    const certificationCenterToCreate = new CertificationCenterInvitation({
      email,
      certificationCenterId,
      status: CertificationCenterInvitation.StatusType.PENDING,
      updatedAt,
      code,
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

export default CertificationCenterInvitation;
