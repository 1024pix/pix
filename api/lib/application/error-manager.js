const HttpErrors = require('./http-errors');
const DomainErrors = require('../domain/errors');
const JSONAPI = require('../interfaces/jsonapi');
const errorSerializer = require('../infrastructure/serializers/jsonapi/error-serializer');

module.exports = { handle };

function handle(h, error) {
  if (error instanceof DomainErrors.EntityValidationError) {
    return h.response(JSONAPI.unprocessableEntityError(error.invalidAttributes)).code(422);
  }

  const httpError = _mapToHttpError(error);

  return h.response(errorSerializer.serialize(httpError)).code(httpError.status);
}

function _mapToHttpError(error) {
  if (error instanceof HttpErrors.BaseHttpError) {
    return error;
  }

  if (error instanceof DomainErrors.AlreadyRatedAssessmentError) {
    return new HttpErrors.PreconditionFailedError('Assessment is already rated.');
  }
  if (error instanceof DomainErrors.CompetenceResetError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.ChallengeAlreadyAnsweredError) {
    return new HttpErrors.ConflictError('This challenge has already been answered.');
  }
  if (error instanceof DomainErrors.NotFoundError) {
    return new HttpErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.CampaignCodeError) {
    return new HttpErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToAccessEntity) {
    return new HttpErrors.ForbiddenError('Utilisateur non autorisé à accéder à la ressource');
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToUpdateResourceError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToCreateCampaignError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToGetCertificationCoursesError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.CertificationCandidateAlreadyLinkedToUserError) {
    return new HttpErrors.ForbiddenError('Le candidat de certification est déjà lié à un utilisateur.');
  }
  if (error instanceof DomainErrors.CertificationCandidateByPersonalInfoNotFoundError) {
    return new HttpErrors.NotFoundError('Aucun candidat de certification ne correspond aux informations d\'identité fournies.');
  }
  if (error instanceof DomainErrors.CertificationCandidateByPersonalInfoTooManyMatchesError) {
    return new HttpErrors.ConflictError('Plus d\'un candidat de certification correspondent aux informations d\'identité fournies.');
  }
  if (error instanceof DomainErrors.CertificationCandidatePersonalInfoFieldMissingError) {
    return new HttpErrors.BadRequestError('Un ou plusieurs champs d\'informations d\'identité sont manquants.');
  }
  if (error instanceof DomainErrors.CertificationCandidatePersonalInfoWrongFormat) {
    return new HttpErrors.BadRequestError('Un ou plusieurs champs d\'informations d\'identité sont au mauvais format.');
  }
  if (error instanceof DomainErrors.CertificationCandidateForbiddenDeletionError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.CertificationCenterMembershipCreationError) {
    return new HttpErrors.BadRequestError('Le membre ou le centre de certification n\'existe pas.');
  }
  if (error instanceof DomainErrors.InvalidCertificationReportForFinalization) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.InvalidParametersForSessionPublication) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.AlreadyExistingMembershipError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.AlreadyExistingOrganizationInvitationError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.AlreadyExistingCampaignParticipationError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.AlreadySharedCampaignParticipationError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.ForbiddenAccess) {
    return new HttpErrors.ForbiddenError(error.message);
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
  if (error instanceof DomainErrors.FileValidationError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof DomainErrors.SchoolingRegistrationsCouldNotBeSavedError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.SameNationalStudentIdInOrganizationError) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof DomainErrors.SameNationalStudentIdInFileError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof DomainErrors.InvalidCertificationCandidate) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.AssessmentNotCompletedError) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof DomainErrors.UserAlreadyLinkedToCandidateInSessionError) {
    return new HttpErrors.ForbiddenError('L\'utilisateur est déjà lié à un candidat dans cette session.');
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToCertifyError) {
    return new HttpErrors.ForbiddenError('The user cannot be certified.');
  }
  if (error instanceof DomainErrors.MissingOrInvalidCredentialsError) {
    return new HttpErrors.UnauthorizedError('L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.');
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToGetCampaignResultsError) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.UserNotFoundError) {
    return new HttpErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.UserShouldChangePasswordError) {
    return new HttpErrors.PasswordShouldChangeError(error.message);
  }
  if (error instanceof DomainErrors.PasswordResetDemandNotFoundError) {
    return new HttpErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.InvalidTemporaryKeyError) {
    return new HttpErrors.UnauthorizedError(error.message);
  }
  if (error instanceof DomainErrors.WrongDateFormatError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.SessionAlreadyFinalizedError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.SchoolingRegistrationAlreadyLinkedToUserError) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToUpdateStudentPasswordError) {
    return new HttpErrors.ForbiddenError(error.message);
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

  return new HttpErrors.BaseHttpError(error.message);
}
