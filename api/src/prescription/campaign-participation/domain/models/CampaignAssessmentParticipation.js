import { CampaignParticipationStatuses } from '../../../shared/domain/constants.ts';

const { SHARED } = CampaignParticipationStatuses;

export class CampaignAssessmentParticipation {
  constructor({
    userId,
    firstName,
    lastName,
    campaignParticipationId,
    campaignId,
    participantExternalId,
    masteryRate,
    validatedSkillsCount,
    sharedAt,
    status,
    createdAt,
    organizationLearnerId,
    badges,
    reachedStage,
    totalStage,
    prescriberTitle,
    prescriberDescription,
    progression,
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
    this.progression = progression;
    this.badges = badges ?? [];
    this.masteryRate = masteryRate != null ? Number(masteryRate) : null;
    this.validatedSkillsCount = validatedSkillsCount;
    this.reachedStage = reachedStage ?? null;
    this.totalStage = totalStage ?? null;
    this.prescriberTitle = prescriberTitle ?? null;
    this.prescriberDescription = prescriberDescription ?? null;
  }

  setBadges(badges) {
    this.badges = badges;
  }

  setProgression(completionRate) {
    this.progression = completionRate;
  }

  setStageInfo(reachedStage) {
    this.reachedStage = reachedStage.reachedStage;
    this.totalStage = reachedStage.totalStage;
    this.prescriberTitle = reachedStage.prescriberTitle;
    this.prescriberDescription = reachedStage.prescriberDescription;
  }
}
