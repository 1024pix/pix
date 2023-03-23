const BaseJoi = require('joi');
const JoiDate = require('@joi/date');
const Joi = BaseJoi.extend(JoiDate);
const { validateEntity } = require('../validators/entity-validator.js');
const _ = require('lodash');

const validationSchema = Joi.object({
  participantFirstName: Joi.string().required().allow(''),
  participantLastName: Joi.string().required().allow(''),
  participantExternalId: Joi.string().optional().allow(null),
  studentNumber: Joi.string().optional().allow(null),
  userId: Joi.number().integer().required(),
  campaignParticipationId: Joi.number().integer().required(),
  isCompleted: Joi.boolean().required(),
  createdAt: Joi.date().required(),
  sharedAt: Joi.date().required().allow(null),
  division: Joi.string().allow(null).optional(),
  group: Joi.string().allow(null).optional(),
  masteryRate: Joi.number().required().allow(null),
  validatedSkillsCount: Joi.number().required().allow(null),
});

class CampaignParticipationInfo {
  constructor({
    participantFirstName,
    participantLastName,
    participantExternalId = null,
    studentNumber = null,
    userId,
    campaignParticipationId,
    isCompleted,
    createdAt,
    sharedAt,
    division,
    group,
    masteryRate,
    validatedSkillsCount,
  } = {}) {
    this.participantFirstName = participantFirstName;
    this.participantLastName = participantLastName;
    this.participantExternalId = participantExternalId;
    this.studentNumber = studentNumber;
    this.userId = userId;
    this.campaignParticipationId = campaignParticipationId;
    this.isCompleted = isCompleted;
    this.createdAt = createdAt;
    this.sharedAt = sharedAt;
    this.division = division;
    this.group = group;
    this.masteryRate = !_.isNil(masteryRate) ? Number(masteryRate) : null;
    this.validatedSkillsCount = !_.isNil(validatedSkillsCount) ? Number(validatedSkillsCount) : null;
    validateEntity(validationSchema, this);
  }

  get isShared() {
    return Boolean(this.sharedAt);
  }
}

module.exports = CampaignParticipationInfo;
