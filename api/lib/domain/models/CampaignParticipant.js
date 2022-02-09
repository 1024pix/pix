const { EntityValidationError, ForbiddenAccess, AlreadyExistingCampaignParticipationError } = require('../errors');
const CampaignParticipation = require('./CampaignParticipation');
const Assessment = require('./Assessment');
const couldNotJoinCampaignErrorMessage = "Vous n'êtes pas autorisé à rejoindre la campagne";
const couldNotImproveCampaignErrorMessage = 'Vous ne pouvez pas repasser la campagne';

class CampaignParticipant {
  constructor({ campaignToStartParticipation, schoolingRegistrationId, userId, previousCampaignParticipation }) {
    this.campaignToStartParticipation = campaignToStartParticipation;
    this.schoolingRegistrationId = schoolingRegistrationId;
    this.userId = userId;
    this.previousCampaignParticipation = previousCampaignParticipation;
  }

  start({ participantExternalId }) {
    this._checkCanParticipateToCampaign(participantExternalId);

    const participantExternalIdToUse =
      this.previousCampaignParticipation?.participantExternalId || participantExternalId;
    let startAgainCampaign = false;
    if (this.previousCampaignParticipation) {
      startAgainCampaign = true;
      this.previousCampaignParticipation.isImproved = true;
    }

    if (this.campaignToStartParticipation.isAssessment) {
      this.assessment = Assessment.createForCampaign({
        userId: this.userId,
        isImproving: startAgainCampaign,
        method: this.campaignToStartParticipation.assessmentMethod,
      });
    }

    this.campaignParticipation = CampaignParticipation.start({
      campaign: this.campaignToStartParticipation,
      campaignId: this.campaignToStartParticipation.id,
      userId: this.userId,
      schoolingRegistrationId: this.schoolingRegistrationId,
      participantExternalId: participantExternalIdToUse,
    });
  }

  _checkCanParticipateToCampaign(participantExternalId) {
    if (this.campaignToStartParticipation.isArchived) {
      throw new ForbiddenAccess(couldNotJoinCampaignErrorMessage);
    }

    if (this.campaignToStartParticipation.isRestricted && !this.schoolingRegistrationId) {
      throw new ForbiddenAccess(couldNotJoinCampaignErrorMessage);
    }

    if (this.previousCampaignParticipation && !this.campaignToStartParticipation.multipleSendings) {
      throw new AlreadyExistingCampaignParticipationError(
        `User ${this.userId} has already a campaign participation with campaign ${this.campaignToStartParticipation.id}`
      );
    }
    if (this.previousCampaignParticipation && this.previousCampaignParticipation.status !== 'SHARED') {
      throw new ForbiddenAccess(couldNotImproveCampaignErrorMessage);
    }
    if (this._canImproveResults()) {
      throw new ForbiddenAccess(couldNotImproveCampaignErrorMessage);
    }

    if (this._isMissingParticipantExternalId(participantExternalId)) {
      throw new EntityValidationError({
        invalidAttributes: [
          {
            attribute: 'participantExternalId',
            message: 'Un identifiant externe est requis pour accèder à la campagne.',
          },
        ],
      });
    }
  }

  _canImproveResults() {
    return (
      this.campaignToStartParticipation.isAssessment &&
      this.previousCampaignParticipation &&
      this.previousCampaignParticipation.validatedSkillsCount >= this.campaignToStartParticipation.skillCount
    );
  }

  _isMissingParticipantExternalId(participantExternalId) {
    return (
      this.campaignToStartParticipation.idPixLabel && !participantExternalId && !this.previousCampaignParticipation
    );
  }
}

module.exports = CampaignParticipant;
