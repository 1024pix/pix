const CampaignProfileCompetence = require('./CampaignProfileCompetence');
const CampaignParticipationStatuses = require('../models/CampaignParticipationStatuses');

const { SHARED } = CampaignParticipationStatuses;

class CampaignProfile {
  constructor({
    firstName,
    lastName,
    placementProfile,
    campaignParticipationId,
    campaignId,
    participantExternalId,
    sharedAt,
    status,
    createdAt,
    pixScore,
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.campaignParticipationId = campaignParticipationId;
    this.campaignId = campaignId;
    this.externalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.isShared = status === SHARED;
    this.createdAt = createdAt;
    this.placementProfile = placementProfile;
    this.pixScore = pixScore;
  }

  get isCertifiable() {
    if (this.isShared) {
      return this.placementProfile.isCertifiable();
    }
    return null;
  }

  get certifiableCompetencesCount() {
    if (this.isShared) {
      return this.placementProfile.getCertifiableCompetencesCount();
    }
    return null;
  }

  get competencesCount() {
    if (this.isShared) {
      return this.placementProfile.getCompetencesCount();
    }
    return null;
  }

  get competences() {
    if (this.isShared) {
      return this.placementProfile.userCompetences.map((competence) => {
        return new CampaignProfileCompetence(competence);
      });
    }
    return [];
  }
}

module.exports = CampaignProfile;
