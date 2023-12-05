import { Assessment } from '../../../src/shared/domain/models/Assessment.js';
import { CampaignParticipationStatuses } from '../../../src/prescription/shared/domain/constants.js';
import _ from 'lodash';

const { SHARED } = CampaignParticipationStatuses;

class CampaignAssessmentParticipation {
  constructor({
    userId,
    firstName,
    lastName,
    campaignParticipationId,
    campaignId,
    participantExternalId,
    assessmentState,
    masteryRate,
    validatedSkillsCount,
    sharedAt,
    status,
    createdAt,
    targetedSkillsCount,
    testedSkillsCount,
    organizationLearnerId,
    badges = [],
    reachedStage,
    totalStage,
    prescriberTitle,
    prescriberDescription,
  }) {
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.organizationLearnerId = organizationLearnerId;
    this.campaignParticipationId = campaignParticipationId;
    this.campaignId = campaignId;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.isShared = status === SHARED;
    this.createdAt = createdAt;
    this.progression = this._computeProgression(assessmentState, testedSkillsCount, targetedSkillsCount);
    this.badges = badges;
    this.masteryRate = !_.isNil(masteryRate) ? Number(masteryRate) : null;
    this.validatedSkillsCount = validatedSkillsCount;
    this.reachedStage = reachedStage;
    this.totalStage = totalStage;
    this.prescriberTitle = prescriberTitle;
    this.prescriberDescription = prescriberDescription;
  }

  _computeProgression(assessmentState, testedSkillsCount, targetedSkillsCount) {
    if (assessmentState === Assessment.states.COMPLETED) return 1;
    return Number((testedSkillsCount / targetedSkillsCount).toFixed(2));
  }

  setBadges(badges) {
    this.badges = badges;
  }

  setStageInfo(reachedStage) {
    this.reachedStage = reachedStage.reachedStage;
    this.totalStage = reachedStage.totalStage;
    this.prescriberTitle = reachedStage.prescriberTitle;
    this.prescriberDescription = reachedStage.prescriberDescription;
  }
}

export { CampaignAssessmentParticipation };
