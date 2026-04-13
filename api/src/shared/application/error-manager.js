import _ from 'lodash';

import { AdminMemberError } from '../../authorization/domain/errors.js';
import { ChallengeAlreadyAnsweredError } from '../../certification/evaluation/domain/errors.js';
import { CertificateGenerationError } from '../../certification/results/domain/errors.js';
import {
  CsvWithNoSessionDataError,
  SendingEmailToRefererError,
  SendingEmailToResultRecipientError,
} from '../../certification/session-management/domain/errors.js';
import { AlreadyRatedAssessmentError, EmptyAnswerError } from '../../evaluation/domain/errors.js';
import * as LLMDomainErrors from '../../llm/domain/errors.js';
import {
  ArchiveOrganizationError,
  UnableToAttachChildOrganizationToParentOrganizationError,
} from '../../organizational-entities/domain/errors.js';
import { ArchivedCampaignError, DeletedCampaignError } from '../../prescription/campaign/domain/errors.js';
import { CampaignParticipationDeletedError } from '../../prescription/campaign-participation/domain/errors.js';
import { AggregateImportError, SiecleXmlImportError } from '../../prescription/learner-management/domain/errors.js';
import { OrganizationCantGetPlacesStatisticsError } from '../../prescription/organization-place/domain/errors.js';
import {
  AlreadyAcceptedOrCancelledInvitationError,
  UserHasNoOrganizationMembershipError,
  UserNotMemberOfOrganizationError,
} from '../../team/domain/errors.js';
import * as SharedDomainErrors from '../domain/errors.js';
import { getBaseLocale } from '../domain/services/locale-service.js';
import { getI18n } from '../infrastructure/i18n/i18n.js';
import { getChallengeLocale } from '../infrastructure/utils/request-response-utils.js';
import { domainErrorMapper } from './domain-error-mapper.js';
import { HttpErrors } from './http-errors.js';

const NOT_VALID_RELATIONSHIPS = ['externalId', 'participantExternalId'];

function translateMessage(locale, key) {
  const i18n = getI18n(locale);
  if (!key) return key;

  // use regexp to remove i18n key special chars from key
  const i18nKey = `entity-validation-errors.${key}`.replace(/[:{}%]/g, '');
  const translation = i18n.__(i18nKey);

  // when the i18n key is returned, so the translation does not exist
  if (translation === i18nKey) return key;

  return translation;
}

function _formatUndefinedAttribute({ message, locale, meta }) {
  const errorContent = {
    message: translateMessage(locale, message),
    code: undefined,
    meta,
    source: undefined,
    title: 'Invalid data attributes',
  };

  return new HttpErrors.InvalidEntityError(errorContent);
}

function _formatRelationship({ attribute, message, locale, meta }) {
  const relationship = attribute.replace('Id', '');

  const errorContent = {
    message: translateMessage(locale, message),
    code: undefined,
    meta,
    source: {
      pointer: `/data/relationships/${_.kebabCase(relationship)}`,
    },
    title: `Invalid relationship "${relationship}"`,
  };

  return new HttpErrors.InvalidEntityError(errorContent);
}

function _formatAttribute({ attribute, message, locale, meta }) {
  const errorContent = {
    message: translateMessage(locale, message),
    code: undefined,
    meta,
    source: {
      pointer: `/data/attributes/${_.kebabCase(attribute)}`,
    },
    title: `Invalid data attribute "${attribute}"`,
  };

  return new HttpErrors.InvalidEntityError(errorContent);
}

function _formatInvalidAttribute(locale, meta, { attribute, message }) {
  if (!attribute) {
    return _formatUndefinedAttribute({ message, locale, meta });
  }
  if (attribute.endsWith('Id') && !NOT_VALID_RELATIONSHIPS.includes(attribute)) {
    return _formatRelationship({ attribute, message, locale, meta });
  }
  return _formatAttribute({ attribute, message, locale, meta });
}

function _mapToHttpError(error) {
  if (error instanceof HttpErrors.BaseHttpError) {
    return error;
  }
  if (error instanceof SharedDomainErrors.CertificationCandidateNotFoundError) {
    return new HttpErrors.NotFoundError(error.message, error.code);
  }
  if (error instanceof SharedDomainErrors.NotFoundError) {
    return new HttpErrors.NotFoundError(error.message);
  }
  if (error instanceof SharedDomainErrors.ForbiddenAccess) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }
  if (error instanceof SharedDomainErrors.CsvImportError) {
    return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
  }
  if (error instanceof SharedDomainErrors.UserNotAuthorizedToAccessEntityError) {
    return new HttpErrors.ForbiddenError('Utilisateur non autorisé à accéder à la ressource');
  }
  if (error instanceof SharedDomainErrors.UserIsTemporaryBlocked) {
    return new HttpErrors.ForbiddenError(error.message, error.code, error.meta);
  }
  if (error instanceof SharedDomainErrors.UserHasAlreadyLeftSCO) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof SharedDomainErrors.UserAlreadyExistsWithAuthenticationMethodError) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof SharedDomainErrors.UserNotFoundError) {
    return new HttpErrors.NotFoundError(error.message);
  }
  if (error instanceof SharedDomainErrors.UserIsBlocked) {
    return new HttpErrors.ForbiddenError(error.message, error.code, error.meta);
  }
  if (error instanceof SharedDomainErrors.UserAlreadyLinkedToCandidateInSessionError) {
    return new HttpErrors.ForbiddenError("L'utilisateur est déjà lié à un candidat dans cette session.");
  }
  if (error instanceof SharedDomainErrors.AlreadyRegisteredEmailError) {
    return new HttpErrors.BadRequestError(error.message, error.code);
  }
  if (error instanceof SharedDomainErrors.AssessmentLackOfChallengesError) {
    return new HttpErrors.UnprocessableEntityError(error.message, 'ASSESSMENT_LACK_OF_CHALLENGES', {
      isToBeCancelled: error.isToBeCancelled,
    });
  }
  if (error instanceof SharedDomainErrors.AssessmentEndedError) {
    return new HttpErrors.BaseHttpError(error.message);
  }
  if (error instanceof CertificateGenerationError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof SharedDomainErrors.UserCouldNotBeReconciledError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof SharedDomainErrors.EmailModificationDemandNotFoundOrExpiredError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }
  if (error instanceof SharedDomainErrors.InvalidExternalUserTokenError) {
    return new HttpErrors.UnauthorizedError(error.message);
  }
  if (error instanceof SharedDomainErrors.InvalidResultRecipientTokenError) {
    return new HttpErrors.UnauthorizedError(error.message);
  }
  if (error instanceof SharedDomainErrors.InvalidTemporaryKeyError) {
    return new HttpErrors.UnauthorizedError(error.message);
  }
  if (error instanceof SharedDomainErrors.InvalidVerificationCodeError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }
  if (error instanceof SharedDomainErrors.LanguageNotSupportedError) {
    return new HttpErrors.BadRequestError(error.message, error.code, error.meta);
  }
  if (error instanceof AdminMemberError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code);
  }
  if (error instanceof SharedDomainErrors.NoCertificateForDivisionError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof OrganizationCantGetPlacesStatisticsError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }

  if (error instanceof SharedDomainErrors.AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError) {
    return new HttpErrors.BadRequestError(error.message);
  }

  if (error instanceof SharedDomainErrors.TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof SiecleXmlImportError) {
    return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
  }
  if (error instanceof ArchivedCampaignError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }

  if (error instanceof DeletedCampaignError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }

  if (error instanceof ChallengeAlreadyAnsweredError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code);
  }

  if (error instanceof CsvWithNoSessionDataError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code);
  }

  if (error instanceof SharedDomainErrors.OidcError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
  }

  if (error instanceof SharedDomainErrors.InvalidInputDataError) {
    return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
  }

  if (error instanceof CampaignParticipationDeletedError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }

  if (error instanceof EmptyAnswerError) {
    return new HttpErrors.BadRequestError(error.message, error.code);
  }

  if (error instanceof SendingEmailToRefererError) {
    return new HttpErrors.ServiceUnavailableError(error.message);
  }

  if (error instanceof SharedDomainErrors.SendingEmailError) {
    return new HttpErrors.ServiceUnavailableError(error.message);
  }

  if (error instanceof SharedDomainErrors.CertificationCandidatesError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
  }
  if (error instanceof SharedDomainErrors.AuthenticationMethodAlreadyExistsError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof SharedDomainErrors.ApplicationWithInvalidCredentialsError) {
    return new HttpErrors.UnauthorizedError('The client ID and/or secret are invalid.');
  }
  if (error instanceof SharedDomainErrors.MissingAttributesError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof SendingEmailToResultRecipientError) {
    return new HttpErrors.ServiceUnavailableError(error.message);
  }
  if (error instanceof SharedDomainErrors.InvalidPasswordForUpdateEmailError) {
    return new HttpErrors.BadRequestError(error.message);
  }

  if (error instanceof SharedDomainErrors.UserNotAuthorizedToUpdateEmailError) {
    return new HttpErrors.ForbiddenError(error.message);
  }

  if (error instanceof SharedDomainErrors.UserNotAuthorizedToUpdatePasswordError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }

  if (error instanceof SharedDomainErrors.AlreadyExistingEntityError) {
    return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
  }
  if (error instanceof UnableToAttachChildOrganizationToParentOrganizationError) {
    return new HttpErrors.ConflictError(error.message, error.code, error.meta);
  }
  if (error instanceof SharedDomainErrors.AccountRecoveryDemandExpired) {
    return new HttpErrors.UnauthorizedError(error.message);
  }
  if (error instanceof SharedDomainErrors.AccountRecoveryUserAlreadyConfirmEmail) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof AlreadyRatedAssessmentError) {
    return new HttpErrors.PreconditionFailedError('Assessment is already rated.');
  }
  if (error instanceof SharedDomainErrors.NotEnoughDaysPassedBeforeResetCampaignParticipationError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof SharedDomainErrors.NoCampaignParticipationForUserAndCampaign) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof SharedDomainErrors.OrganizationLearnerDisabledError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof SharedDomainErrors.NoOrganizationToAttach) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof SharedDomainErrors.ChallengeAlreadyAnsweredError) {
    return new HttpErrors.ConflictError('This challenge has already been answered.');
  }
  if (error instanceof SharedDomainErrors.ChallengeNotAskedError) {
    return new HttpErrors.ConflictError('This challenge has not been asked to the user.');
  }
  if (error instanceof SharedDomainErrors.NotFoundError) {
    return new HttpErrors.NotFoundError(error.message, error.code);
  }
  if (error instanceof SharedDomainErrors.DeletedError) {
    return new HttpErrors.ConflictError(error.message, error.code);
  }
  if (error instanceof SharedDomainErrors.CampaignCodeError) {
    return new HttpErrors.NotFoundError(error.message);
  }
  if (error instanceof SharedDomainErrors.UserNotAuthorizedToUpdateResourceError) {
    return new HttpErrors.ForbiddenError(error.message);
  }

  if (error instanceof SharedDomainErrors.UserNotAuthorizedToGenerateUsernamePasswordError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof SharedDomainErrors.UserNotAuthorizedToRemoveAuthenticationMethod) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof SharedDomainErrors.CandidateAlreadyLinkedToUserError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }
  if (error instanceof SharedDomainErrors.CertificationCandidateByPersonalInfoNotFoundError) {
    return new HttpErrors.NotFoundError(
      "Aucun candidat de certification ne correspond aux informations d'identité fournies.",
    );
  }
  if (error instanceof SharedDomainErrors.CertificationCandidateByPersonalInfoTooManyMatchesError) {
    return new HttpErrors.ConflictError(
      "Plus d'un candidat de certification correspondent aux informations d'identité fournies.",
    );
  }
  if (error instanceof SharedDomainErrors.CertificationCandidatePersonalInfoFieldMissingError) {
    return new HttpErrors.BadRequestError("Un ou plusieurs champs d'informations d'identité sont manquants.");
  }
  if (error instanceof SharedDomainErrors.CertificationCandidatePersonalInfoWrongFormat) {
    return new HttpErrors.BadRequestError("Un ou plusieurs champs d'informations d'identité sont au mauvais format.");
  }
  if (error instanceof SharedDomainErrors.CancelledInvitationError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof SharedDomainErrors.CertificationCenterMembershipCreationError) {
    return new HttpErrors.BadRequestError("Le membre ou le centre de certification n'existe pas.");
  }
  if (error instanceof SharedDomainErrors.InvalidExternalAPIResponseError) {
    return new HttpErrors.ServiceUnavailableError(error.message);
  }
  if (error instanceof SharedDomainErrors.UnexpectedUserAccountError) {
    return new HttpErrors.ConflictError(error.message, error.code, error.meta);
  }
  if (error instanceof SharedDomainErrors.AlreadyExistingMembershipError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof SharedDomainErrors.AlreadyExistingInvitationError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof AlreadyAcceptedOrCancelledInvitationError) {
    return new HttpErrors.ConflictError(error.message, error.code);
  }
  if (error instanceof SharedDomainErrors.AlreadyExistingCampaignParticipationError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof SharedDomainErrors.AlreadySharedCampaignParticipationError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof SharedDomainErrors.MembershipCreationError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof SharedDomainErrors.MembershipUpdateError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof SharedDomainErrors.ObjectValidationError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof SharedDomainErrors.OrganizationNotFoundError) {
    return new HttpErrors.NotFoundError(error.message);
  }
  if (error instanceof SharedDomainErrors.OrganizationWithoutEmailError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof SharedDomainErrors.ManyOrganizationsFoundError) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof SharedDomainErrors.FileValidationError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
  }
  if (error instanceof SharedDomainErrors.OrganizationLearnersCouldNotBeSavedError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof SharedDomainErrors.OrganizationLearnersConstraintError) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof SharedDomainErrors.AssessmentNotCompletedError) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof SharedDomainErrors.UserNotAuthorizedToCertifyError) {
    return new HttpErrors.ForbiddenError('The user cannot be certified.');
  }
  if (error instanceof SharedDomainErrors.ApplicationScopeNotAllowedError) {
    return new HttpErrors.ForbiddenError('The scope is not allowed.');
  }
  if (error instanceof SharedDomainErrors.UserNotAuthorizedToGetCampaignResultsError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof SharedDomainErrors.AlreadyRegisteredEmailAndUsernameError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof SharedDomainErrors.AlreadyRegisteredUsernameError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof SharedDomainErrors.WrongDateFormatError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof SharedDomainErrors.OrganizationLearnerAlreadyLinkedToUserError) {
    return new HttpErrors.ConflictError(error.message, error.code, error.meta);
  }
  if (error instanceof SharedDomainErrors.OrganizationLearnerAlreadyLinkedToInvalidUserError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof SharedDomainErrors.MatchingReconciledStudentNotFoundError) {
    return new HttpErrors.BadRequestError(error.message, error.code);
  }

  if (error instanceof SharedDomainErrors.UserNotAuthorizedToCreateResourceError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof SharedDomainErrors.UserOrgaSettingsCreationError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof UserNotMemberOfOrganizationError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof UserHasNoOrganizationMembershipError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }
  if (error instanceof SharedDomainErrors.TargetProfileInvalidError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof SharedDomainErrors.NoStagesForCampaign) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof SharedDomainErrors.CampaignTypeError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }

  if (error instanceof SharedDomainErrors.InvalidMembershipOrganizationRoleError) {
    return new HttpErrors.BadRequestError(error.message);
  }

  if (error instanceof SharedDomainErrors.OidcMissingFieldsError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
  }

  if (error instanceof SharedDomainErrors.InvalidIdentityProviderError) {
    return new HttpErrors.BadRequestError(error.message);
  }

  if (error instanceof SharedDomainErrors.YamlParsingError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
  }

  if (error instanceof SharedDomainErrors.MultipleOrganizationLearnersWithDifferentNationalStudentIdError) {
    return new HttpErrors.ConflictError(error.message);
  }

  if (error instanceof SharedDomainErrors.UserShouldNotBeReconciledOnAnotherAccountError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
  }

  if (error instanceof SharedDomainErrors.CandidateNotAuthorizedToJoinSessionError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }

  if (error instanceof SharedDomainErrors.CandidateNotAuthorizedToResumeCertificationTestError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }

  if (error instanceof SharedDomainErrors.CertificationCandidateOnFinalizedSessionError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }

  if (error instanceof SharedDomainErrors.OrganizationLearnerCannotBeDissociatedError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }

  if (error instanceof SharedDomainErrors.CertificationEndedByFinalizationError) {
    return new HttpErrors.ConflictError(error.message);
  }

  if (error instanceof SharedDomainErrors.InvalidJuryLevelError) {
    return new HttpErrors.BadRequestError(error.message);
  }

  if (error instanceof SharedDomainErrors.SendingEmailToInvalidDomainError) {
    return new HttpErrors.BadRequestError(error.message, 'SENDING_EMAIL_TO_INVALID_DOMAIN');
  }

  if (error instanceof SharedDomainErrors.SendingEmailToInvalidEmailAddressError) {
    return new HttpErrors.BadRequestError(error.message, 'SENDING_EMAIL_TO_INVALID_EMAIL_ADDRESS', error.meta);
  }

  if (error instanceof SharedDomainErrors.InvalidSessionResultTokenError) {
    return new HttpErrors.BadRequestError(error.message, error.code);
  }

  if (error instanceof LLMDomainErrors.ConfigurationNotFoundError) {
    return new HttpErrors.BadRequestError(error.message, error.code);
  }

  if (error instanceof LLMDomainErrors.LLMApiError) {
    return new HttpErrors.ServiceUnavailableError(error.message, error.code);
  }

  if (error instanceof LLMDomainErrors.TooLargeMessageInputError) {
    return new HttpErrors.PayloadTooLargeError(error.message, error.code);
  }

  if (error instanceof LLMDomainErrors.MaxPromptsReachedError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }

  if (error instanceof LLMDomainErrors.ChatNotFoundError) {
    return new HttpErrors.NotFoundError(error.message, error.code);
  }

  if (error instanceof LLMDomainErrors.NoUserIdProvidedError) {
    return new HttpErrors.BadRequestError(error.message, error.code);
  }

  if (error instanceof LLMDomainErrors.ChatForbiddenError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }

  if (error instanceof LLMDomainErrors.NoAttachmentNeededError) {
    return new HttpErrors.BadRequestError(error.message, error.code);
  }

  if (error instanceof LLMDomainErrors.NoAttachmentNorMessageProvidedError) {
    return new HttpErrors.BadRequestError(error.message, error.code);
  }

  if (error instanceof LLMDomainErrors.PromptAlreadyOngoingError) {
    return new HttpErrors.ConflictError(error.message, error.code);
  }

  if (error instanceof LLMDomainErrors.IncorrectMessagesOrderingError) {
    return new HttpErrors.InternalServerError(error.message);
  }

  if (error instanceof ArchiveOrganizationError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code);
  }

  return new HttpErrors.BaseHttpError(error.message);
}

function handle(request, h, error) {
  if (error instanceof SharedDomainErrors.EntityValidationError) {
    const locale = getChallengeLocale(request);
    const language = getBaseLocale(locale);

    const jsonApiError =
      error.invalidAttributes?.map(_formatInvalidAttribute.bind(_formatInvalidAttribute, language, error.meta)) ||
      new HttpErrors.InvalidEntityError();
    return HttpErrors.sendJsonApiError(jsonApiError, h);
  }

  const httpError = domainErrorMapper.mapToHttpError(error) ?? _mapToHttpError(error);

  if (error instanceof AggregateImportError) {
    httpError.meta.forEach((error) => {
      error.status = httpError.status;
    });
    return HttpErrors.sendJsonApiError(httpError.meta, h);
  }

  return HttpErrors.sendJsonApiError(httpError, h);
}

export { _mapToHttpError, handle };
