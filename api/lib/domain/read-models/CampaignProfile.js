const CampaignProfileCompetence = require('./CampaignProfileCompetence');

class CampaignProfile {

  constructor({
    firstName,
    lastName,
    certificationProfile,
    campaignParticipationId,
    campaignId,
    participantExternalId,
    sharedAt,
    isShared,
    createdAt
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.campaignParticipationId = campaignParticipationId;
    this.campaignId = campaignId;
    this.externalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.isShared = isShared;
    this.createdAt = createdAt;
    this.certificationProfile  = certificationProfile;
  }

  get pixScore() {
    if (this.isShared) {
      return this.certificationProfile.getPixScore();
    }
    return null;
  }

  get isCertifiable() {
    if (this.isShared) {
      return this.certificationProfile.isCertifiable();
    }
    return null;
  }

  get certifiableCompetencesCount() {
    if (this.isShared) {
      return this.certificationProfile.getCertifiableCompetencesCount();
    }
    return null;
  }

  get competencesCount() {
    if (this.isShared) {
      return this.certificationProfile.getCompetencesCount();
    }
    return null;
  }

  get competences() {
    if (this.isShared) {
      return this.certificationProfile.userCompetences.map((competence) => {
        return new CampaignProfileCompetence(competence);
      });
    }
    return [];
  }
}

module.exports = CampaignProfile;

