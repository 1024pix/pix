import { CampaignProfileCompetence } from './CampaignProfileCompetence.js';
import { CampaignParticipationStatuses } from '../../../src/prescription/shared/domain/constants.js';

const { SHARED } = CampaignParticipationStatuses;

class CampaignProfile {
  constructor({
    firstName,
    lastName,
    placementProfile,
    campaignParticipationId,
    organizationLearnerId,
    campaignId,
    participantExternalId,
    sharedAt,
    status,
    createdAt,
    pixScore,
    allAreas,
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.campaignParticipationId = campaignParticipationId;
    this.organizationLearnerId = organizationLearnerId;
    this.campaignId = campaignId;
    this.externalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.isShared = status === SHARED;
    this.createdAt = createdAt;
    this.placementProfile = placementProfile;
    this.pixScore = pixScore;
    this.allAreas = allAreas;
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
        const area = this.allAreas.find((area) => area.id === competence.areaId);
        return new CampaignProfileCompetence({
          id: competence.id,
          index: competence.index,
          name: competence.name,
          pixScore: competence.pixScore,
          estimatedLevel: competence.estimatedLevel,
          areaColor: area.color,
        });
      });
    }
    return [];
  }
}

export { CampaignProfile };
