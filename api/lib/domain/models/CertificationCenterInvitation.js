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
  certificationCenterId: Joi.number().optional(),
});

class CertificationCenterInvitation {
  constructor({ id, email, updatedAt, certificationCenterId } = {}) {
    this.id = id;
    this.email = email;
    this.updatedAt = updatedAt;
    this.certificationCenterId = certificationCenterId;

    validateEntity(validationScheme, this);
  }
}

CertificationCenterInvitation.StatusType = statuses;

module.exports = CertificationCenterInvitation;
