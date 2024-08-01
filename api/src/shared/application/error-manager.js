import jsonapiSerializer from 'jsonapi-serializer';
import _ from 'lodash';

import * as translations from '../../../translations/index.js';
import { AdminMemberError } from '../../authorization/domain/errors.js';
import { CsvWithNoSessionDataError } from '../../certification/session-management/domain/errors.js';
import { EmptyAnswerError } from '../../evaluation/domain/errors.js';
import { UnableToAttachChildOrganizationToParentOrganizationError } from '../../organizational-entities/domain/errors.js';
import { ArchivedCampaignError, DeletedCampaignError } from '../../prescription/campaign/domain/errors.js';
import { CampaignParticipationDeletedError } from '../../prescription/campaign-participation/domain/errors.js';
import { AggregateImportError, SiecleXmlImportError } from '../../prescription/learner-management/domain/errors.js';
import { OrganizationCantGetPlacesStatisticsError } from '../../prescription/organization-place/domain/errors.js';
import * as DomainErrors from '../domain/errors.js';
import {
  AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError,
  CertificationCenterPilotFeaturesConflictError,
  EntityValidationError,
  OidcError,
  TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization,
  UserAlreadyExistsWithAuthenticationMethodError,
  UserAlreadyLinkedToCandidateInSessionError,
  UserCouldNotBeReconciledError,
  UserHasAlreadyLeftSCO,
  UserIsBlocked,
  UserIsTemporaryBlocked,
  UserNotAuthorizedToAccessEntityError,
  UserNotFoundError,
} from '../domain/errors.js';
import * as errorSerializer from '../infrastructure/serializers/jsonapi/error-serializer.js';
import { extractLocaleFromRequest } from '../infrastructure/utils/request-response-utils.js';
import { domainErrorMapper } from './domain-error-mapper.js';
import { HttpErrors } from './http-errors.js';

const { Error: JSONAPIError } = jsonapiSerializer;
const NOT_VALID_RELATIONSHIPS = ['externalId', 'participantExternalId'];

function translateMessage(locale, key) {
  // eslint-disable-next-line import/namespace
  if (translations[locale]['entity-validation-errors'][key]) {
    // eslint-disable-next-line import/namespace
    return translations[locale]['entity-validation-errors'][key];
  }
  return key;
}

function _formatUndefinedAttribute({ message, locale }) {
  return {
    status: '422',
    title: 'Invalid data attributes',
    detail: translateMessage(locale, message),
  };
}

function _formatRelationship({ attribute, message, locale }) {
  const relationship = attribute.replace('Id', '');
  return {
    status: '422',
    source: {
      pointer: `/data/relationships/${_.kebabCase(relationship)}`,
    },
    title: `Invalid relationship "${relationship}"`,
    detail: translateMessage(locale, message),
  };
}

function _formatAttribute({ attribute, message, locale }) {
  return {
    status: '422',
    source: {
      pointer: `/data/attributes/${_.kebabCase(attribute)}`,
    },
    title: `Invalid data attribute "${attribute}"`,
    detail: translateMessage(locale, message),
  };
}

function _formatInvalidAttribute(locale, { attribute, message }) {
  if (!attribute) {
    return _formatUndefinedAttribute({ message, locale });
  }
  if (attribute.endsWith('Id') && !NOT_VALID_RELATIONSHIPS.includes(attribute)) {
    return _formatRelationship({ attribute, message, locale });
  }
  return _formatAttribute({ attribute, message, locale });
}

function _mapToHttpError(error) {
  if (error instanceof HttpErrors.BaseHttpError) {
    return error;
  }
  if (error instanceof DomainErrors.CertificationCandidateNotFoundError) {
    return new HttpErrors.NotFoundError(error.message, error.code);
  }
  if (error instanceof DomainErrors.NotFoundError) {
    return new HttpErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.ForbiddenAccess) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }
  if (error instanceof DomainErrors.CsvImportError) {
    return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
  }
  if (error instanceof UserNotAuthorizedToAccessEntityError) {
    return new HttpErrors.ForbiddenError('Utilisateur non autorisé à accéder à la ressource');
  }
  if (error instanceof UserIsTemporaryBlocked) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }
  if (error instanceof UserHasAlreadyLeftSCO) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof UserAlreadyExistsWithAuthenticationMethodError) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof UserNotFoundError) {
    return new HttpErrors.NotFoundError(error.message);
  }
  if (error instanceof UserNotAuthorizedToAccessEntityError) {
    return new HttpErrors.ForbiddenError('Utilisateur non autorisé à accéder à la ressource');
  }
  if (error instanceof UserIsBlocked) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }
  if (error instanceof UserAlreadyLinkedToCandidateInSessionError) {
    return new HttpErrors.ForbiddenError("L'utilisateur est déjà lié à un candidat dans cette session.");
  }
  if (error instanceof DomainErrors.AlreadyRegisteredEmailError) {
    return new HttpErrors.BadRequestError(error.message, error.code);
  }
  if (error instanceof DomainErrors.AssessmentEndedError) {
    return new HttpErrors.BaseHttpError(error.message);
  }
  if (error instanceof DomainErrors.CertificationAttestationGenerationError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof UserCouldNotBeReconciledError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof DomainErrors.EmailModificationDemandNotFoundOrExpiredError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }
  if (error instanceof DomainErrors.InvalidExternalUserTokenError) {
    return new HttpErrors.UnauthorizedError(error.message);
  }
  if (error instanceof DomainErrors.InvalidResultRecipientTokenError) {
    return new HttpErrors.UnauthorizedError(error.message);
  }
  if (error instanceof DomainErrors.InvalidTemporaryKeyError) {
    return new HttpErrors.UnauthorizedError(error.message);
  }
  if (error instanceof DomainErrors.InvalidVerificationCodeError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }
  if (error instanceof DomainErrors.LocaleFormatError) {
    return new HttpErrors.BadRequestError(error.message, error.code, error.meta);
  }
  if (error instanceof DomainErrors.LanguageNotSupportedError) {
    return new HttpErrors.BadRequestError(error.message, error.code, error.meta);
  }
  if (error instanceof DomainErrors.LocaleNotSupportedError) {
    return new HttpErrors.BadRequestError(error.message, error.code, error.meta);
  }
  if (error instanceof AdminMemberError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code);
  }
  if (error instanceof DomainErrors.NoCertificationAttestationForDivisionError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof OrganizationCantGetPlacesStatisticsError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }

  if (error instanceof AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError) {
    return new HttpErrors.BadRequestError(error.message);
  }

  if (error instanceof TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization) {
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

  if (error instanceof CsvWithNoSessionDataError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code);
  }

  if (error instanceof OidcError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
  }

  if (error instanceof DomainErrors.InvalidInputDataError) {
    return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
  }

  if (error instanceof CampaignParticipationDeletedError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }

  if (error instanceof EmptyAnswerError) {
    return new HttpErrors.BadRequestError(error.message, error.code);
  }

  if (error instanceof DomainErrors.SendingEmailToRefererError) {
    return new HttpErrors.ServiceUnavailableError(error.message);
  }

  if (error instanceof DomainErrors.SendingEmailError) {
    return new HttpErrors.ServiceUnavailableError(error.message);
  }

  if (error instanceof DomainErrors.ApplicationWithInvalidClientIdError) {
    return new HttpErrors.UnauthorizedError('The client ID is invalid.');
  }

  if (error instanceof DomainErrors.CertificationCandidatesError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
  }
  if (error instanceof DomainErrors.AuthenticationMethodAlreadyExistsError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof DomainErrors.ApplicationWithInvalidClientSecretError) {
    return new HttpErrors.UnauthorizedError('The client secret is invalid.');
  }
  if (error instanceof DomainErrors.MissingAttributesError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof DomainErrors.SendingEmailToResultRecipientError) {
    return new HttpErrors.ServiceUnavailableError(error.message);
  }
  if (error instanceof DomainErrors.InvalidPasswordForUpdateEmailError) {
    return new HttpErrors.BadRequestError(error.message);
  }

  if (error instanceof DomainErrors.UserNotAuthorizedToUpdateEmailError) {
    return new HttpErrors.ForbiddenError(error.message);
  }

  if (error instanceof DomainErrors.UserNotAuthorizedToUpdatePasswordError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }

  if (error instanceof CertificationCenterPilotFeaturesConflictError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }

  if (error instanceof DomainErrors.AlreadyExistingEntityError) {
    return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
  }
  if (error instanceof UnableToAttachChildOrganizationToParentOrganizationError) {
    return new HttpErrors.ConflictError(error.message, error.code, error.meta);
  }
  if (error instanceof DomainErrors.AccountRecoveryDemandExpired) {
    return new HttpErrors.UnauthorizedError(error.message);
  }
  if (error instanceof DomainErrors.AccountRecoveryUserAlreadyConfirmEmail) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof DomainErrors.AlreadyRatedAssessmentError) {
    return new HttpErrors.PreconditionFailedError('Assessment is already rated.');
  }
  if (error instanceof DomainErrors.NotEnoughDaysPassedBeforeResetCampaignParticipationError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.NoCampaignParticipationForUserAndCampaign) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.OrganizationLearnerDisabledError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.NoOrganizationToAttach) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.ChallengeAlreadyAnsweredError) {
    return new HttpErrors.ConflictError('This challenge has already been answered.');
  }
  if (error instanceof DomainErrors.ChallengeNotAskedError) {
    return new HttpErrors.ConflictError('This challenge has not been asked to the user.');
  }
  if (error instanceof DomainErrors.NotFoundError) {
    return new HttpErrors.NotFoundError(error.message, error.code);
  }
  if (error instanceof DomainErrors.DeletedError) {
    return new HttpErrors.ConflictError(error.message, error.code);
  }
  if (error instanceof DomainErrors.CampaignCodeError) {
    return new HttpErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToUpdateResourceError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToCreateCampaignError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToGenerateUsernamePasswordError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToRemoveAuthenticationMethod) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.CertificationCandidateAlreadyLinkedToUserError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }
  if (error instanceof DomainErrors.CertificationCandidateByPersonalInfoNotFoundError) {
    return new HttpErrors.NotFoundError(
      "Aucun candidat de certification ne correspond aux informations d'identité fournies.",
    );
  }
  if (error instanceof DomainErrors.CertificationCandidateByPersonalInfoTooManyMatchesError) {
    return new HttpErrors.ConflictError(
      "Plus d'un candidat de certification correspondent aux informations d'identité fournies.",
    );
  }
  if (error instanceof DomainErrors.CertificationCandidatePersonalInfoFieldMissingError) {
    return new HttpErrors.BadRequestError("Un ou plusieurs champs d'informations d'identité sont manquants.");
  }
  if (error instanceof DomainErrors.CertificationCandidatePersonalInfoWrongFormat) {
    return new HttpErrors.BadRequestError("Un ou plusieurs champs d'informations d'identité sont au mauvais format.");
  }
  if (error instanceof DomainErrors.CancelledInvitationError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.CertificationCenterMembershipCreationError) {
    return new HttpErrors.BadRequestError("Le membre ou le centre de certification n'existe pas.");
  }
  if (error instanceof DomainErrors.InvalidExternalAPIResponseError) {
    return new HttpErrors.ServiceUnavailableError(error.message);
  }
  if (error instanceof DomainErrors.UnexpectedUserAccountError) {
    return new HttpErrors.ConflictError(error.message, error.code, error.meta);
  }
  if (error instanceof DomainErrors.AlreadyExistingEntityError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.AlreadyExistingMembershipError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.AlreadyExistingInvitationError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.AlreadyAcceptedOrCancelledInvitationError) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof DomainErrors.AlreadyExistingCampaignParticipationError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.AlreadySharedCampaignParticipationError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.MembershipCreationError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.MembershipUpdateError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.ObjectValidationError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof DomainErrors.OrganizationNotFoundError) {
    return new HttpErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.OrganizationWithoutEmailError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.ManyOrganizationsFoundError) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof DomainErrors.FileValidationError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
  }
  if (error instanceof DomainErrors.OrganizationLearnersCouldNotBeSavedError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.OrganizationLearnersConstraintError) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof DomainErrors.AssessmentNotCompletedError) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToCertifyError) {
    return new HttpErrors.ForbiddenError('The user cannot be certified.');
  }
  if (error instanceof DomainErrors.ApplicationScopeNotAllowedError) {
    return new HttpErrors.ForbiddenError('The scope is not allowed.');
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToGetCampaignResultsError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.AlreadyRegisteredEmailAndUsernameError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.AlreadyRegisteredUsernameError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.WrongDateFormatError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.OrganizationLearnerAlreadyLinkedToUserError) {
    return new HttpErrors.ConflictError(error.message, error.code, error.meta);
  }
  if (error instanceof DomainErrors.OrganizationLearnerAlreadyLinkedToInvalidUserError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.MatchingReconciledStudentNotFoundError) {
    return new HttpErrors.BadRequestError(error.message, error.code);
  }

  if (error instanceof DomainErrors.UserNotAuthorizedToCreateResourceError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.UserOrgaSettingsCreationError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.UserNotMemberOfOrganizationError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof DomainErrors.TargetProfileInvalidError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.NoStagesForCampaign) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.CampaignTypeError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }

  if (error instanceof DomainErrors.TargetProfileCannotBeCreated) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }

  if (error instanceof DomainErrors.InvalidMembershipOrganizationRoleError) {
    return new HttpErrors.BadRequestError(error.message);
  }

  if (error instanceof DomainErrors.OidcMissingFieldsError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
  }

  if (error instanceof DomainErrors.InvalidIdentityProviderError) {
    return new HttpErrors.BadRequestError(error.message);
  }

  if (error instanceof DomainErrors.YamlParsingError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
  }

  if (error instanceof DomainErrors.MultipleOrganizationLearnersWithDifferentNationalStudentIdError) {
    return new HttpErrors.ConflictError(error.message);
  }

  if (error instanceof DomainErrors.UserShouldNotBeReconciledOnAnotherAccountError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
  }

  if (error instanceof DomainErrors.CandidateNotAuthorizedToJoinSessionError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }

  if (error instanceof DomainErrors.CandidateNotAuthorizedToResumeCertificationTestError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }

  if (error instanceof DomainErrors.CertificationCandidateOnFinalizedSessionError) {
    return new HttpErrors.ForbiddenError(error.message);
  }

  if (error instanceof DomainErrors.OrganizationLearnerCannotBeDissociatedError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }

  if (error instanceof DomainErrors.CertificationEndedByFinalizationError) {
    return new HttpErrors.ConflictError(error.message);
  }

  if (error instanceof DomainErrors.InvalidJuryLevelError) {
    return new HttpErrors.BadRequestError(error.message);
  }

  if (error instanceof DomainErrors.SendingEmailToInvalidDomainError) {
    return new HttpErrors.BadRequestError(error.message, 'SENDING_EMAIL_TO_INVALID_DOMAIN');
  }

  if (error instanceof DomainErrors.SendingEmailToInvalidEmailAddressError) {
    return new HttpErrors.BadRequestError(error.message, 'SENDING_EMAIL_TO_INVALID_EMAIL_ADDRESS', error.meta);
  }

  return new HttpErrors.BaseHttpError(error.message);
}

function handle(request, h, error) {
  if (error instanceof EntityValidationError) {
    const locale = extractLocaleFromRequest(request).split('-')[0];

    const jsonApiError = new JSONAPIError(
      error.invalidAttributes?.map(_formatInvalidAttribute.bind(_formatInvalidAttribute, locale)),
    );
    return h.response(jsonApiError).code(422);
  }

  const httpError = domainErrorMapper.mapToHttpError(error) ?? _mapToHttpError(error);

  if (error instanceof AggregateImportError) {
    httpError.meta.forEach((error) => {
      error.status = httpError.status;
    });
    return h.response(errorSerializer.serialize(httpError.meta)).code(httpError.status);
  }

  return h.response(errorSerializer.serialize(httpError)).code(httpError.status);
}

export { _mapToHttpError, handle };
