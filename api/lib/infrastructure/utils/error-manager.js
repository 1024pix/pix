const DomainErrors = require('../../domain/errors');
const InfraErrors = require('../errors');
const JSONAPI = require('../../interfaces/jsonapi');
const errorSerializer = require('../serializers/jsonapi/error-serializer');

module.exports = { send };

function send(h, error) {
  if (error instanceof DomainErrors.EntityValidationError) {
    return h.response(JSONAPI.unprocessableEntityError(error.invalidAttributes)).code(422);
  }

  const infraError = _mapToInfrastructureError(error);

  return h.response(errorSerializer.serialize(infraError)).code(infraError.status);
}

function _mapToInfrastructureError(error) {
  if (error instanceof InfraErrors.InfrastructureError) {
    return error;
  }

  if (error instanceof DomainErrors.AlreadyRatedAssessmentError) {
    return new InfraErrors.PreconditionFailedError('Assessment is already rated.');
  }
  if (error instanceof DomainErrors.CompetenceResetError) {
    return new InfraErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.ChallengeAlreadyAnsweredError) {
    return new InfraErrors.ConflictError('This challenge has already been answered.');
  }
  if (error instanceof DomainErrors.NotFoundError) {
    return new InfraErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.CampaignCodeError) {
    return new InfraErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToAccessEntity) {
    return new InfraErrors.ForbiddenError('Utilisateur non autorisé à accéder à la ressource');
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToUpdateResourceError) {
    return new InfraErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToCreateCampaignError) {
    return new InfraErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToGetCertificationCoursesError) {
    return new InfraErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.CertificationCandidateAlreadyLinkedToUserError) {
    return new InfraErrors.ForbiddenError('Le candidat de certification est déjà lié à un utilisateur.');
  }
  if (error instanceof DomainErrors.CertificationCandidateByPersonalInfoNotFoundError) {
    return new InfraErrors.NotFoundError('Aucun candidat de certification ne correspond aux informations d\'identité fournies.');
  }
  if (error instanceof DomainErrors.CertificationCandidateByPersonalInfoTooManyMatchesError) {
    return new InfraErrors.ConflictError('Plus d\'un candidat de certification correspondent aux informations d\'identité fournies.');
  }
  if (error instanceof DomainErrors.CertificationCandidatePersonalInfoFieldMissingError) {
    return new InfraErrors.BadRequestError('Un ou plusieurs champs d\'informations d\'identité sont manquants.');
  }
  if (error instanceof DomainErrors.CertificationCandidatePersonalInfoWrongFormat) {
    return new InfraErrors.BadRequestError('Un ou plusieurs champs d\'informations d\'identité sont au mauvais format.');
  }
  if (error instanceof DomainErrors.CertificationCandidateForbiddenDeletionError) {
    return new InfraErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.CertificationCenterMembershipCreationError) {
    return new InfraErrors.BadRequestError('Le membre ou le centre de certification n\'existe pas.');
  }
  if (error instanceof DomainErrors.InvalidCertificationReportForFinalization) {
    return new InfraErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.AlreadyExistingMembershipError) {
    return new InfraErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.AlreadyExistingOrganizationInvitationError) {
    return new InfraErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.AlreadyExistingCampaignParticipationError) {
    return new InfraErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.AlreadySharedCampaignParticipationError) {
    return new InfraErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.ForbiddenAccess) {
    return new InfraErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.MembershipCreationError) {
    return new InfraErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.MembershipUpdateError) {
    return new InfraErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.ObjectValidationError) {
    return new InfraErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof DomainErrors.FileValidationError) {
    return new InfraErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof DomainErrors.StudentsCouldNotBeSavedError) {
    return new InfraErrors.ConflictError(error.message);
  }
  if (error instanceof DomainErrors.SameNationalStudentIdInOrganizationError) {
    return new InfraErrors.ConflictError(error.message);
  }
  if (error instanceof DomainErrors.SameNationalStudentIdInFileError) {
    return new InfraErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof DomainErrors.InvalidCertificationCandidate) {
    return new InfraErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.AssessmentNotCompletedError) {
    return new InfraErrors.ConflictError(error.message);
  }
  if (error instanceof DomainErrors.UserAlreadyLinkedToCandidateInSessionError) {
    return new InfraErrors.ForbiddenError('L\'utilisateur est déjà lié à un candidat dans cette session.');
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToCertifyError) {
    return new InfraErrors.ForbiddenError('The user cannot be certified.');
  }
  if (error instanceof DomainErrors.MissingOrInvalidCredentialsError) {
    return new InfraErrors.UnauthorizedError('L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.');
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToGetCampaignResultsError) {
    return new InfraErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.UserNotFoundError) {
    return new InfraErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.PasswordResetDemandNotFoundError) {
    return new InfraErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.InvalidTemporaryKeyError) {
    return new InfraErrors.UnauthorizedError(error.message);
  }
  if (error instanceof DomainErrors.WrongDateFormatError) {
    return new InfraErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.SessionAlreadyFinalizedError) {
    return new InfraErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.OrganizationStudentAlreadyLinkedToUserError) {
    return new InfraErrors.ConflictError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToUpdateStudentPasswordError) {
    return new InfraErrors.ForbiddenError(error.message);
  }

  return new InfraErrors.InfrastructureError(error.message);
}
