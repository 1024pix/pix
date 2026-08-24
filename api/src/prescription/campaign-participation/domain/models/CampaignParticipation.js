import _ from 'lodash';

import {
  AlreadySharedCampaignParticipationError,
  AssessmentNotCompletedError,
  CampaignParticipationDeletedError,
} from '../../../../../src/shared/domain/errors.js';
import { CampaignParticipationLoggerContext } from '../../../../shared/domain/models/jobs/AuditLoggingJob.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import { ArchivedCampaignError } from '../../../shared/domain/errors.js';

class CampaignParticipation {
  #loggerContext;

  constructor({
    id,
    createdAt,
    participantExternalId,
    status,
    sharedAt,
    deletedAt,
    deletedBy,
    assessments,
    campaign,
    userId,
    validatedSkillsCount,
    pixScore,
    organizationLearnerId,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.status = status;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.deletedAt = deletedAt;
    this.deletedBy = deletedBy;
    this.campaign = campaign;
    this.assessments = assessments;
    this.userId = userId;
    this.status = status;
    this.validatedSkillsCount = validatedSkillsCount || null;
    this.pixScore = pixScore || null;
    this.organizationLearnerId = organizationLearnerId;
  }

  static start({ campaign, userId, organizationLearnerId = null, participantExternalId }) {
    const { STARTED } = CampaignParticipationStatuses;
    const status = STARTED;

    return new CampaignParticipation({
      campaign,
      userId,
      participantExternalId,
      status,
      organizationLearnerId,
    });
  }

  get isShared() {
    return this.status === CampaignParticipationStatuses.SHARED;
  }

  get isDeleted() {
    return Boolean(this.deletedAt);
  }

  get lastAssessment() {
    return _.maxBy(this.assessments, 'createdAt');
  }

  get campaignId() {
    return _.get(this, 'campaign.id', null);
  }

  get loggerContext() {
    return this.#loggerContext;
  }

  get dataToUpdateOnDeletion() {
    return {
      id: this.id,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      userId: this.userId,
      participantExternalId: this.participantExternalId,
    };
  }

  get dataToUpdateOnAnonymisation() {
    return {
      id: this.id,
      userId: this.userId,
    };
  }

  share() {
    this._canBeShared();
    this.sharedAt = new Date();
    this.status = CampaignParticipationStatuses.SHARED;
  }

  detachUser() {
    this.userId = null;
  }

  anonymize() {
    this.participantExternalId = null;
    this.detachUser();
    this.#loggerContext = CampaignParticipationLoggerContext.ANONYMIZATION;
  }

  delete(userId) {
    this.anonymize();

    if (!this.isDeleted) {
      this.deletedAt = new Date();
      this.deletedBy = userId;
    }

    this.#loggerContext = CampaignParticipationLoggerContext.DELETION;
  }

  _canBeShared() {
    if (this.isShared) {
      throw new AlreadySharedCampaignParticipationError();
    }
    if (!this.campaign.isAccessible) {
      throw new ArchivedCampaignError('Cannot share results on an archived campaign.');
    }
    if (this.isDeleted) {
      throw new CampaignParticipationDeletedError('Cannot share results on a deleted participation.');
    }
    if (this.campaign.isAssessment && lastAssessmentNotCompleted(this)) {
      throw new AssessmentNotCompletedError();
    }
  }
}

function lastAssessmentNotCompleted(campaignParticipation) {
  return !campaignParticipation.lastAssessment || !campaignParticipation.lastAssessment.isCompleted();
}

export { CampaignParticipation };
