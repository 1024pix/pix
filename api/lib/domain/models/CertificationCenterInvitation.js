const Joi = require('joi').extend(require('@joi/date'));
const { validateEntity } = require('../validators/entity-validator');

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

module.exports = CertificationCenterInvitation;
