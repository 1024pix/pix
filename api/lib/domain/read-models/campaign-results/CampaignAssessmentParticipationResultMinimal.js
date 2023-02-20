import _ from 'lodash';

class CampaignAssessmentParticipationResultMinimal {
  constructor({ campaignParticipationId, firstName, lastName, participantExternalId, masteryRate, badges = [] } = {}) {
    this.campaignParticipationId = campaignParticipationId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participantExternalId = participantExternalId;
    this.masteryRate = !_.isNil(masteryRate) ? Number(masteryRate) : null;
    //TODO REMOVE WHEN https://1024pix.atlassian.net/browse/PIX-6849 IS DONE
    this.badges = _.uniqBy(badges, 'id');
  }
}

export default CampaignAssessmentParticipationResultMinimal;
