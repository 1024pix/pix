const CampaignParticipation = require('./CampaignParticipation.js');

class ParticipationForCampaignManagement {
  constructor({ id, lastName, firstName, participantExternalId, status, createdAt, sharedAt } = {}) {
    this.id = id;
    this.lastName = lastName;
    this.firstName = firstName;
    this.participantExternalId = participantExternalId;
    this.status = status;
    this.createdAt = createdAt;
    this.sharedAt = sharedAt;
  }
}

ParticipationForCampaignManagement.statuses = CampaignParticipation.statuses;

module.exports = ParticipationForCampaignManagement;
