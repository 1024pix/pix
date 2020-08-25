const Joi = require('@hapi/joi')
  .extend(require('@hapi/joi-date'));
const { validateEntity } = require('../validators/entity-validator');

const validationSchema = Joi.object({
  participantFirstName: Joi.string().required(),
  participantLastName: Joi.string().required(),
  participantExternalId: Joi.string().optional().allow(null),
  userId: Joi.number().integer().required(),
  isCompleted: Joi.boolean().required(),
  createdAt: Joi.date().required(),
  sharedAt: Joi.date().required().allow(null),
});

class CampaignParticipationInfo {

  constructor({
    participantFirstName,
    participantLastName,
    participantExternalId,
    userId,
    isCompleted,
    createdAt,
    sharedAt,
  } = {}) {
    this.participantFirstName = participantFirstName;
    this.participantLastName = participantLastName;
    this.participantExternalId = participantExternalId;
    this.userId = userId;
    this.isCompleted = isCompleted;
    this.createdAt = createdAt;
    this.sharedAt = sharedAt;

    validateEntity(validationSchema, this);
  }

  get isShared() {
    return Boolean(this.sharedAt);
  }
}

module.exports = CampaignParticipationInfo;
