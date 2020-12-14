const CampaignProfileCompetence = require('./CampaignProfileCompetence');

class CampaignProfile {

  constructor({
    firstName,
    lastName,
    placementProfile,
    campaignParticipationId,
    campaignId,
    participantExternalId,
    sharedAt,
    isShared,
    createdAt,
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.campaignParticipationId = campaignParticipationId;
    this.campaignId = campaignId;
    this.externalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.isShared = isShared;
    this.createdAt = createdAt;
    this.placementProfile = placementProfile;
  }

  get pixScore() {
    if (this.isShared) {
      return this.placementProfile.getPixScore();
    }
    return null;
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

