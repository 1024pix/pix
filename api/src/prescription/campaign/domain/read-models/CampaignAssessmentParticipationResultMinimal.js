import _ from 'lodash';

class CampaignAssessmentParticipationResultMinimal {
  #previousMasteryRate;
  constructor({
    campaignParticipationId,
    firstName,
    lastName,
    participantExternalId,
    masteryRate,
    previousMasteryRate,
    reachedStage,
    totalStage,
    prescriberTitle,
    prescriberDescription,
    sharedResultCount,
    badges = [],
  }) {
    this.campaignParticipationId = campaignParticipationId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participantExternalId = participantExternalId;
    this.masteryRate = !_.isNil(masteryRate) ? Number(masteryRate) : null;
    this.#previousMasteryRate = !_.isNil(previousMasteryRate) ? Number(previousMasteryRate) : null;
    this.reachedStage = reachedStage;
    this.totalStage = totalStage;
    this.prescriberTitle = prescriberTitle;
    this.prescriberDescription = prescriberDescription;
    //TODO REMOVE WHEN https://1024pix.atlassian.net/browse/PIX-6849 IS DONE
    this.badges = _.uniqBy(badges, 'id');
    this.sharedResultCount = sharedResultCount;
    this.evolution = this.#computeEvolution();
  }

  #computeEvolution() {
    if ([this.#previousMasteryRate, this.masteryRate].includes(null)) return null;
    if (this.masteryRate > this.#previousMasteryRate) return 'increase';
    if (this.masteryRate < this.#previousMasteryRate) return 'decrease';
    if (this.masteryRate === this.#previousMasteryRate) return 'stable';
  }
}

export { CampaignAssessmentParticipationResultMinimal };
