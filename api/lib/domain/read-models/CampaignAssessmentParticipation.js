import Assessment from '../models/Assessment';
import CampaignParticipationStatuses from '../models/CampaignParticipationStatuses';
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
    sharedAt,
    status,
    createdAt,
    targetedSkillsCount,
    testedSkillsCount,
    badges = [],
  }) {
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.campaignParticipationId = campaignParticipationId;
    this.campaignId = campaignId;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.isShared = status === SHARED;
    this.createdAt = createdAt;
    this.progression = this._computeProgression(assessmentState, testedSkillsCount, targetedSkillsCount);
    this.badges = badges;
    this.masteryRate = !_.isNil(masteryRate) ? Number(masteryRate) : null;
  }

  _computeProgression(assessmentState, testedSkillsCount, targetedSkillsCount) {
    if (assessmentState === Assessment.states.COMPLETED) return 1;
    return Number((testedSkillsCount / targetedSkillsCount).toFixed(2));
  }

  setBadges(badges) {
    this.badges = badges;
  }
}

export default CampaignAssessmentParticipation;
