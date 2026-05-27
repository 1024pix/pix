import * as SharedDomainErrors from '../../domain/errors.js';
import { HttpErrors } from './http-errors.js';

const NOT_FOUND_ERRORS = [
  SharedDomainErrors.NotFoundError,
  SharedDomainErrors.UserNotFoundError,
  SharedDomainErrors.OrganizationNotFoundError,
  SharedDomainErrors.CampaignCodeError,
  SharedDomainErrors.CertificationCandidateByPersonalInfoNotFoundError,
];

const FORBIDDEN_ERRORS = [
  SharedDomainErrors.ForbiddenAccess,
  SharedDomainErrors.UserIsTemporaryBlocked,
  SharedDomainErrors.UserHasAlreadyLeftSCO,
  SharedDomainErrors.UserIsBlocked,
  SharedDomainErrors.InvalidVerificationCodeError,
  SharedDomainErrors.EmailModificationDemandNotFoundOrExpiredError,
  SharedDomainErrors.UserNotAuthorizedToUpdateEmailError,
  SharedDomainErrors.UserNotAuthorizedToUpdatePasswordError,
  SharedDomainErrors.CandidateAlreadyLinkedToUserError,
  SharedDomainErrors.UserNotAuthorizedToUpdateResourceError,
  SharedDomainErrors.UserNotAuthorizedToGenerateUsernamePasswordError,
  SharedDomainErrors.UserNotAuthorizedToRemoveAuthenticationMethod,
  SharedDomainErrors.UserNotAuthorizedToGetCampaignResultsError,
  SharedDomainErrors.UserNotAuthorizedToCreateResourceError,
  SharedDomainErrors.CancelledInvitationError,
  SharedDomainErrors.CandidateNotAuthorizedToJoinSessionError,
  SharedDomainErrors.CandidateNotAuthorizedToResumeCertificationTestError,
  SharedDomainErrors.CertificationCandidateOnFinalizedSessionError,
  SharedDomainErrors.UserNotAuthorizedToAccessEntityError,
  SharedDomainErrors.UserAlreadyLinkedToCandidateInSessionError,
  SharedDomainErrors.UserNotAuthorizedToCertifyError,
  SharedDomainErrors.ApplicationScopeNotAllowedError,
];

const CONFLICT_ERRORS = [
  SharedDomainErrors.ChallengeAlreadyAnsweredError,
  SharedDomainErrors.UserAlreadyExistsWithAuthenticationMethodError,
  SharedDomainErrors.UnexpectedUserAccountError,
  SharedDomainErrors.AccountRecoveryUserAlreadyConfirmEmail,
  SharedDomainErrors.OrganizationLearnerAlreadyLinkedToUserError,
  SharedDomainErrors.AssessmentNotCompletedError,
  SharedDomainErrors.ManyOrganizationsFoundError,
  SharedDomainErrors.OrganizationLearnersConstraintError,
  SharedDomainErrors.DeletedError,
  SharedDomainErrors.CertificationEndedByFinalizationError,
  SharedDomainErrors.MultipleOrganizationLearnersWithDifferentNationalStudentIdError,
  SharedDomainErrors.ChallengeNotAskedError,
  SharedDomainErrors.CertificationCandidateByPersonalInfoTooManyMatchesError,
];

const PRECONDITION_FAILED_ERRORS = [
  SharedDomainErrors.CsvImportError,
  SharedDomainErrors.AlreadyExistingEntityError,
  SharedDomainErrors.InvalidInputDataError,
  SharedDomainErrors.CampaignParticipationDeletedError,
  SharedDomainErrors.NotEnoughDaysPassedBeforeResetCampaignParticipationError,
  SharedDomainErrors.NoCampaignParticipationForUserAndCampaign,
  SharedDomainErrors.OrganizationLearnerDisabledError,
  SharedDomainErrors.NoOrganizationToAttach,
  SharedDomainErrors.OrganizationLearnerCannotBeDissociatedError,
  SharedDomainErrors.AlreadyExistingMembershipError,
  SharedDomainErrors.AlreadyExistingInvitationError,
  SharedDomainErrors.AlreadyExistingCampaignParticipationError,
  SharedDomainErrors.AlreadySharedCampaignParticipationError,
  SharedDomainErrors.OrganizationWithoutEmailError,
  SharedDomainErrors.TargetProfileInvalidError,
  SharedDomainErrors.NoStagesForCampaign,
  SharedDomainErrors.CampaignTypeError,
];

const BAD_REQUEST_ERRORS = [
  SharedDomainErrors.AlreadyRegisteredEmailError,
  SharedDomainErrors.NoCertificateForDivisionError,
  SharedDomainErrors.LanguageNotSupportedError,
  SharedDomainErrors.InvalidPasswordForUpdateEmailError,
  SharedDomainErrors.AlreadyRegisteredEmailAndUsernameError,
  SharedDomainErrors.AlreadyRegisteredUsernameError,
  SharedDomainErrors.WrongDateFormatError,
  SharedDomainErrors.OrganizationLearnerAlreadyLinkedToInvalidUserError,
  SharedDomainErrors.MatchingReconciledStudentNotFoundError,
  SharedDomainErrors.MembershipCreationError,
  SharedDomainErrors.MembershipUpdateError,
  SharedDomainErrors.OrganizationLearnersCouldNotBeSavedError,
  SharedDomainErrors.InvalidMembershipOrganizationRoleError,
  SharedDomainErrors.InvalidIdentityProviderError,
  SharedDomainErrors.InvalidJuryLevelError,
  SharedDomainErrors.InvalidSessionResultTokenError,
  SharedDomainErrors.UserOrgaSettingsCreationError,
  SharedDomainErrors.AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError,
  SharedDomainErrors.TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization,
  SharedDomainErrors.CertificationCandidatePersonalInfoFieldMissingError,
  SharedDomainErrors.CertificationCandidatePersonalInfoWrongFormat,
  SharedDomainErrors.CertificationCenterMembershipCreationError,
  SharedDomainErrors.SendingEmailToInvalidDomainError,
  SharedDomainErrors.SendingEmailToInvalidEmailAddressError,
  SharedDomainErrors.AssessmentEndedError,
];

const UNPROCESSABLE_ENTITY_ERRORS = [
  SharedDomainErrors.UserCouldNotBeReconciledError,
  SharedDomainErrors.OidcError,
  SharedDomainErrors.AuthenticationMethodAlreadyExistsError,
  SharedDomainErrors.MissingAttributesError,
  SharedDomainErrors.CertificationCandidatesError,
  SharedDomainErrors.ObjectValidationError,
  SharedDomainErrors.FileValidationError,
  SharedDomainErrors.OidcMissingFieldsError,
  SharedDomainErrors.YamlParsingError,
  SharedDomainErrors.UserShouldNotBeReconciledOnAnotherAccountError,
  SharedDomainErrors.FeatureDisabledError,
];

const UNAUTHORIZED_ERRORS = [
  SharedDomainErrors.InvalidExternalUserTokenError,
  SharedDomainErrors.InvalidResultRecipientTokenError,
  SharedDomainErrors.InvalidTemporaryKeyError,
  SharedDomainErrors.AccountRecoveryDemandExpired,
  SharedDomainErrors.ApplicationWithInvalidCredentialsError,
];

const SERVICE_UNAVAILABLE_ERRORS = [
  SharedDomainErrors.SendingEmailError,
  SharedDomainErrors.InvalidExternalAPIResponseError,
];

export function mapToHttpError(error) {
  if (NOT_FOUND_ERRORS.some((E) => error instanceof E))
    return new HttpErrors.NotFoundError(error.message, error.code, error.meta);
  if (FORBIDDEN_ERRORS.some((E) => error instanceof E))
    return new HttpErrors.ForbiddenError(error.message, error.code, error.meta);
  if (CONFLICT_ERRORS.some((E) => error instanceof E))
    return new HttpErrors.ConflictError(error.message, error.code, error.meta);
  if (PRECONDITION_FAILED_ERRORS.some((E) => error instanceof E))
    return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
  if (BAD_REQUEST_ERRORS.some((E) => error instanceof E))
    return new HttpErrors.BadRequestError(error.message, error.code, error.meta);
  if (UNPROCESSABLE_ENTITY_ERRORS.some((E) => error instanceof E))
    return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
  if (UNAUTHORIZED_ERRORS.some((E) => error instanceof E))
    return new HttpErrors.UnauthorizedError(error.message, error.code, error.meta);
  if (SERVICE_UNAVAILABLE_ERRORS.some((E) => error instanceof E))
    return new HttpErrors.ServiceUnavailableError(error.message);

  return new HttpErrors.BaseHttpError(error.message);
}
