import _ from 'lodash';

export class CampaignAssessmentParticipationResultMinimal {
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
    this.masteryRate = masteryRate != null ? Number(masteryRate) : null;
    this.#previousMasteryRate = previousMasteryRate != null ? Number(previousMasteryRate) : null;
    this.reachedStage = reachedStage;
    this.totalStage = totalStage;
    this.prescriberTitle = prescriberTitle;
    this.prescriberDescription = prescriberDescription;
    //TODO REMOVE WHEN https://1024pix.atlassian.net/browse/PIX-6849 IS DONE
    this.badges = _.uniqBy(badges, 'id').map(({ id, title, altMessage, imageUrl }) => ({
      id,
      title,
      altMessage,
      imageUrl,
    }));
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
