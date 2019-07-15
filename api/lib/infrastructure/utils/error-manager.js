const DomainErrors = require('../../domain/errors');
const InfraErrors = require('../errors');
const JSONAPI = require('../../interfaces/jsonapi');
const errorSerializer = require('../serializers/jsonapi/error-serializer');
const logger = require('../logger');

module.exports = { send };

function send(h, error) {
  logger.error(error);

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
    return new InfraErrors.ForbiddenError('Utilisateur non authorisé à accéder à la ressource');
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToUpdateResourceError) {
    return new InfraErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToCreateCampaignError) {
    return new InfraErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.CertificationCenterMembershipCreationError) {
    return new InfraErrors.BadRequestError('Le membre ou le centre de certification n\'existe pas.');
  }
  if (error instanceof DomainErrors.AlreadyExistingMembershipError) {
    return new InfraErrors.PreconditionFailedError(error.message);
  }
  if (error instanceof DomainErrors.ForbiddenAccess) {
    return new InfraErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.MembershipCreationError) {
    return new InfraErrors.BadRequestError(error.message);
  }
  if (error instanceof DomainErrors.AssessmentStartError) {
    return new InfraErrors.ConflictError(error.message);
  }
  if (error instanceof DomainErrors.ObjectValidationError) {
    return new InfraErrors.UnprocessableEntityError(error.message);
  }
  if (error instanceof DomainErrors.AssessmentNotCompletedError) {
    return new InfraErrors.ConflictError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToCertifyError) {
    return new InfraErrors.ForbiddenError('The user cannot be certified.');
  }
  if (error instanceof DomainErrors.MissingOrInvalidCredentialsError) {
    return new InfraErrors.UnauthorizedError('Bad credentials');
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
  if (error instanceof DomainErrors.InvalidTokenError) {
    return new InfraErrors.UnauthorizedError('Le token n’est pas valide');
  }
  if (error instanceof DomainErrors.InvaliOrganizationIdError) {
    return new InfraErrors.UnprocessableEntityError('Cette organisation n’existe pas');
  }
  if (error instanceof DomainErrors.InvalidSnapshotCode) {
    return new InfraErrors.UnprocessableEntityError('Les codes de partage du profil sont trop longs');
  }
  if (error instanceof DomainErrors.WrongDateFormatError) {
    return new InfraErrors.BadRequestError(error.message);
  }

  return new InfraErrors.InfrastructureError(error.message);
}
