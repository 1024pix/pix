const DomainErrors = require('../../domain/errors');
const InfraErrors = require('../errors');

function mapToInfrastructureErrors(error) {
  if (error instanceof DomainErrors.ChallengeAlreadyAnsweredError) {
    return new InfraErrors.ConflictError('This challenge has already been answered.');
  }
  if (error instanceof DomainErrors.NotFoundError) {
    return new InfraErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToAccessEntity) {
    return new InfraErrors.ForbiddenError('Utilisateur non authorisé à accéder à la ressource');
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToUpdateResourceError) {
    return new InfraErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToUpdateResourceError) {
    return new InfraErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.CertificationCenterMembershipCreationError) {
    return new InfraErrors.BadRequestError('Le membre ou le centre de certification n\'existe pas.');
  }
  if (error instanceof DomainErrors.AlreadyExistingMembershipError) {
    return new InfraErrors.BadRequestError('Ce membre est déjà lié à ce centre de certification.');
  }
  if(error instanceof DomainErrors.ForbiddenAccess) {
    return new InfraErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.MembershipCreationError) {
    return new InfraErrors.BadRequestError(error.message);
  }

  return error;
}

module.exports = {
  mapToInfrastructureErrors,
};
