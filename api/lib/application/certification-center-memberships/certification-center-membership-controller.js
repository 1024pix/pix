const usecases = require('../../domain/usecases');
const controllerReplies = require('../../infrastructure/controller-replies');
const infraErrors = require('../../infrastructure/errors');
const { CertificationCenterMembershipCreationError } = require('../../domain/errors');

module.exports = {

  create(request, h) {
    const userId = request.payload.data.attributes['user-id'];
    const certificationCenterId = request.payload.data.attributes['certification-center-id'];
    return usecases.createCertificationCenterMembership({ userId, certificationCenterId })
      .then(controllerReplies(h).created)
      .catch((error) => {
        if (error instanceof CertificationCenterMembershipCreationError) {
          const badRequestError = new infraErrors.BadRequestError(error.message);
          return controllerReplies(h).error(badRequestError);
        }

        return controllerReplies(h).error(error);
      });
  },
};
