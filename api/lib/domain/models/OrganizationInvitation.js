const BaseJoi = require('joi');
const JoiDate = require('@joi/date');
const Joi = BaseJoi.extend(JoiDate);
const { validateEntity } = require('../validators/entity-validator');

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
  email: Joi.string().optional(),
  status: Joi.string().optional(),
  code: Joi.string().optional(),
  organizationName: Joi.string().allow(null).optional(),
  role: Joi.string()
    .valid(...Object.values(roles))
    .optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
  organizationId: Joi.number().optional(),
});

class OrganizationInvitation {
  constructor({
    id,
    email,
    status,
    code,
    organizationName,
    role,
    createdAt,
    updatedAt,
    //references
    organizationId,
  } = {}) {
    this.id = id;
    this.email = email;
    this.status = status;
    this.code = code;
    this.organizationName = organizationName;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    //references
    this.organizationId = organizationId;

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

OrganizationInvitation.StatusType = statuses;

module.exports = OrganizationInvitation;
