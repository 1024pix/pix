const { EntityValidationError, ForbiddenAccess, AlreadyExistingCampaignParticipationError } = require('../errors.js');
const CampaignParticipation = require('./CampaignParticipation.js');
const Assessment = require('./Assessment.js');
const OrganizationLearner = require('./OrganizationLearner.js');
const couldNotJoinCampaignErrorMessage = "Vous n'êtes pas autorisé à rejoindre la campagne";
const couldNotImproveCampaignErrorMessage = 'Vous ne pouvez pas repasser la campagne';

class CampaignParticipant {
  constructor({
    campaignToStartParticipation,
    organizationLearner,
    userIdentity,
    previousCampaignParticipationForUser,
  }) {
    this.campaignToStartParticipation = campaignToStartParticipation;
    this.organizationLearnerId = organizationLearner?.id;
    this.userIdentity = userIdentity;
    this.previousCampaignParticipationForUser = previousCampaignParticipationForUser;
    this.organizationLearnerHasParticipatedForAnotherUser = organizationLearner.hasParticipated;
  }

  start({ participantExternalId }) {
    this._checkCanParticipateToCampaign(participantExternalId);

    const participantExternalIdToUse =
      this.previousCampaignParticipationForUser?.participantExternalId || participantExternalId;
    let startAgainCampaign = false;
    if (this.previousCampaignParticipationForUser) {
      startAgainCampaign = true;
      this.previousCampaignParticipationForUser.isImproved = true;
    }

    if (this._shouldCreateOrganizationLearner()) {
      this.organizationLearner = new OrganizationLearner({
        userId: this.userIdentity.id,
        organizationId: this.campaignToStartParticipation.organizationId,
        firstName: this.userIdentity.firstName,
        lastName: this.userIdentity.lastName,
      });
    }

    if (this.campaignToStartParticipation.isAssessment) {
      this.assessment = Assessment.createForCampaign({
        userId: this.userIdentity.id,
        isImproving: startAgainCampaign,
        method: this.campaignToStartParticipation.assessmentMethod,
      });
    }

    this.campaignParticipation = CampaignParticipation.start({
      campaign: this.campaignToStartParticipation,
      userId: this.userIdentity.id,
      organizationLearnerId: this.organizationLearnerId,
      participantExternalId: participantExternalIdToUse,
    });
  }

  _shouldCreateOrganizationLearner() {
    return !this.campaignToStartParticipation.isRestricted && !this.organizationLearnerId;
  }

  _checkCanParticipateToCampaign(participantExternalId) {
    if (this.campaignToStartParticipation.isArchived) {
      throw new ForbiddenAccess(couldNotJoinCampaignErrorMessage);
    }

    if (this.campaignToStartParticipation.isRestricted && !this.organizationLearnerId) {
      throw new ForbiddenAccess(couldNotJoinCampaignErrorMessage);
    }

    if (this.previousCampaignParticipationForUser && !this.campaignToStartParticipation.multipleSendings) {
      throw new AlreadyExistingCampaignParticipationError(
        `User ${this.userIdentity.id} has already a campaign participation with campaign ${this.campaignToStartParticipation.id}`
      );
    }

    if (this.previousCampaignParticipationForUser?.isDeleted) {
      throw new ForbiddenAccess(couldNotImproveCampaignErrorMessage);
    }

    if (['STARTED', 'TO_SHARE'].includes(this.previousCampaignParticipationForUser?.status)) {
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

    if (this.organizationLearnerHasParticipatedForAnotherUser) {
      throw new AlreadyExistingCampaignParticipationError('ORGANIZATION_LEARNER_HAS_ALREADY_PARTICIPATED');
    }
  }

  _canImproveResults() {
    return (
      this.campaignToStartParticipation.isAssessment &&
      this.previousCampaignParticipationForUser &&
      this.previousCampaignParticipationForUser.validatedSkillsCount >= this.campaignToStartParticipation.skillCount
    );
  }

  _isMissingParticipantExternalId(participantExternalId) {
    return (
      this.campaignToStartParticipation.idPixLabel &&
      !participantExternalId &&
      !this.previousCampaignParticipationForUser
    );
  }
}

module.exports = CampaignParticipant;
