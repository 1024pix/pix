import { JoiDate } from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { validateEntity } from '../../../../shared/domain/validators/entity-validator.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';

const validationSchema = Joi.object({
  participantFirstName: Joi.string().required().allow(''),
  participantLastName: Joi.string().required().allow(''),
  participantExternalId: Joi.string().optional().allow(null),
  additionalInfos: Joi.object().allow(null),
  studentNumber: Joi.string().optional().allow(null),
  userId: Joi.number().integer().required().allow(null),
  campaignParticipationId: Joi.number().integer().required(),
  isCompleted: Joi.boolean().required(),
  createdAt: Joi.date().required(),
  sharedAt: Joi.date().required().allow(null),
  division: Joi.string().allow(null).optional(),
  group: Joi.string().allow(null).optional(),
  masteryRate: Joi.number().required().allow(null),
  validatedSkillsCount: Joi.number().required().allow(null),
  status: Joi.string()
    .valid(...Object.values(CampaignParticipationStatuses))
    .required(),
  pixScore: Joi.number().default(null).allow(null),
});

export class CampaignParticipationInfo {
  constructor({
    participantFirstName,
    participantLastName,
    participantExternalId = null,
    studentNumber = null,
    userId,
    additionalInfos,
    campaignParticipationId,
    isCompleted,
    createdAt,
    sharedAt,
    division,
    group,
    masteryRate,
    validatedSkillsCount,
    status,
    pixScore,
  } = {}) {
    this.participantFirstName = participantFirstName;
    this.participantLastName = participantLastName;
    this.participantExternalId = participantExternalId;
    this.studentNumber = studentNumber;
    this.userId = userId;
    this.additionalInfos = additionalInfos;
    this.campaignParticipationId = campaignParticipationId;
    this.isCompleted = isCompleted;
    this.createdAt = createdAt;
    this.sharedAt = sharedAt;
    this.division = division;
    this.group = group;
    this.masteryRate = masteryRate != null ? Number(masteryRate) : null;
    this.validatedSkillsCount = validatedSkillsCount != null ? Number(validatedSkillsCount) : null;
    this.status = status;
    this.pixScore = pixScore;
    validateEntity(validationSchema, this);
  }

  get id() {
    return this.campaignParticipationId;
  }

  get isShared() {
    return Boolean(this.sharedAt);
  }
}
