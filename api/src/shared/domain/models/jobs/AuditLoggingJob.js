import Joi from 'joi';

import { EntityValidationError } from '../../errors.js';

export const CampaignParticipationLoggerContext = {
  DELETION: 'CAMPAIGN_PARTICIPATION_DELETION',
  ANONYMIZATION: 'CAMPAIGN_PARTICIPATION_ANONYMIZATION',
};

export const OrganizationLearnerLoggerContext = {
  DELETION: 'ORGANIZATION_LEARNER_DELETION',
  ANONYMIZATION: 'ORGANIZATION_LEARNER_ANONYMIZATION',
};

const CLIENTS = ['PIX_ADMIN', 'PIX_APP', 'PIX_ORGA', 'SCRIPT'];
const ACTIONS = [
  'ANONYMIZATION',
  'ANONYMIZATION_GAR',
  'EMAIL_ADDED',
  'EMAIL_CHANGED',
  ...Object.values(CampaignParticipationLoggerContext),
  ...Object.values(OrganizationLearnerLoggerContext),
];
const ROLES = ['SUPER_ADMIN', 'SUPPORT', 'USER', 'ORGA_ADMIN'];

const AuditLogSchema = Joi.object({
  client: Joi.string()
    .valid(...CLIENTS)
    .required(),
  action: Joi.string()
    .valid(...ACTIONS)
    .required(),
  role: Joi.string()
    .valid(...ROLES)
    .required(),
  userId: Joi.number().required(),
  targetUserIds: Joi.array().items(Joi.number()).min(1).required(),
  data: Joi.object().optional(),
  occurredAt: Joi.date().optional(),
});

export class AuditLoggingJob {
  constructor({ client, action, role, userId, targetUserIds, data, occurredAt }) {
    this.client = client;
    this.action = action;
    this.role = role;
    this.userId = userId;
    this.targetUserIds = targetUserIds;
    this.data = data;
    this.occurredAt = occurredAt || new Date();

    this.#validate();
  }

  static forUser({ client, action, role, userId, updatedByUserId, data, occurredAt }) {
    return new AuditLoggingJob({
      client,
      action,
      role,
      targetUserIds: userId ? [userId] : [],
      userId: updatedByUserId,
      data,
      occurredAt,
    });
  }

  static forUsers({ client, action, role, userIds, updatedByUserId, data, occurredAt }) {
    return new AuditLoggingJob({
      client,
      action,
      role,
      targetUserIds: userIds ? userIds : [],
      userId: updatedByUserId,
      data,
      occurredAt,
    });
  }

  #validate() {
    const { error } = AuditLogSchema.validate(this, { abortEarly: false });
    if (error) throw EntityValidationError.fromJoiErrors(error.details);
  }
}
