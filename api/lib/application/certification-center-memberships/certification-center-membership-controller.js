const usecases = require('../../domain/usecases');
const controllerReplies = require('../../infrastructure/controller-replies');
const domainToInfraErrorsConverter = require('../../infrastructure/utils/domain-to-infra-errors-converter');

module.exports = {

  create(request, h) {
    const userId = request.payload.data.attributes['user-id'];
    const certificationCenterId = request.payload.data.attributes['certification-center-id'];
    return usecases.createCertificationCenterMembership({ userId, certificationCenterId })
      .then((membership) => h.response(membership).created())
      .catch((error) => {
        const mappedError = domainToInfraErrorsConverter.mapToInfrastructureErrors(error);
        return controllerReplies(h).error(mappedError);
      });
  },
};
