import {
  AlreadyExistingCampaignParticipationError,
  NotEnoughDaysPassedBeforeResetCampaignParticipationError,
} from '../../../../shared/domain/errors.js';
import { EntityValidationError, ForbiddenAccess } from '../../../../shared/domain/errors.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { OrganizationLearner } from '../../../../shared/domain/models/OrganizationLearner.js';
import { CampaignParticipation } from './CampaignParticipation.js';

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
    this.userIdentity = userIdentity;
    this.previousCampaignParticipationForUser = previousCampaignParticipationForUser;
    this.organizationLearnerId = organizationLearner.id;
    this.isOrganizationLearnerDisabled = organizationLearner.isDisabled;
    this.hasOrganizationLearnerParticipatedForAnotherUser = organizationLearner.hasParticipated;
  }

  start({ participantExternalId, isReset }) {
    this._checkCanParticipateToCampaign(participantExternalId, isReset);

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

  _checkCanParticipateToCampaign(participantExternalId, isReset) {
    if (this.isOrganizationLearnerDisabled) {
      throw new ForbiddenAccess(couldNotJoinCampaignErrorMessage);
    }

    if (this.campaignToStartParticipation.isArchived || this.campaignToStartParticipation.isDeleted) {
      throw new ForbiddenAccess(couldNotJoinCampaignErrorMessage);
    }

    if (this.campaignToStartParticipation.isRestricted && !this.organizationLearnerId) {
      throw new ForbiddenAccess(couldNotJoinCampaignErrorMessage);
    }

    if (this.previousCampaignParticipationForUser && !this.campaignToStartParticipation.multipleSendings) {
      throw new AlreadyExistingCampaignParticipationError(
        `User ${this.userIdentity.id} has already a campaign participation with campaign ${this.campaignToStartParticipation.id}`,
      );
    }

    if (this.previousCampaignParticipationForUser?.isDeleted) {
      throw new ForbiddenAccess(couldNotImproveCampaignErrorMessage);
    }

    if (['STARTED', 'TO_SHARE'].includes(this.previousCampaignParticipationForUser?.status)) {
      throw new ForbiddenAccess(couldNotImproveCampaignErrorMessage);
    }

    if (!isReset && this._canImproveResults()) {
      throw new ForbiddenAccess(couldNotImproveCampaignErrorMessage);
    }

    if (isReset && this.previousCampaignParticipationForUser && !this.previousCampaignParticipationForUser.canReset) {
      throw new NotEnoughDaysPassedBeforeResetCampaignParticipationError();
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

    if (this.hasOrganizationLearnerParticipatedForAnotherUser) {
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

export { CampaignParticipant };
