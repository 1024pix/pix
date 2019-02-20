const usecases = require('../../domain/usecases');
const certificationCenterSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-serializer');
const sessionSerializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const controllerReplies = require('../../infrastructure/controller-replies');
const domainToInfraErrorsConverter = require('../../infrastructure/utils/domain-to-infra-errors-converter');

module.exports = {

  save(request, h) {
    const certificationCenter = certificationCenterSerializer.deserialize(request.payload);
    return usecases.saveCertificationCenter({ certificationCenter })
      .then(certificationCenterSerializer.serialize)
      .catch((error) => {
        const mappedError = domainToInfraErrorsConverter.mapToInfrastructureErrors(error);
        return controllerReplies(h).error(mappedError);
      });
  },

  getById(request, h) {
    const certificationCenterId = request.params.id;
    return usecases.getCertificationCenter({ id: certificationCenterId })
      .then(certificationCenterSerializer.serialize)
      .catch((error) => {
        const mappedError = domainToInfraErrorsConverter.mapToInfrastructureErrors(error);
        return controllerReplies(h).error(mappedError);
      });
  },

  find(request, h) {
    return usecases.findCertificationCenters()
      .then(certificationCenterSerializer.serialize)
      .catch((error) => {
        const mappedError = domainToInfraErrorsConverter.mapToInfrastructureErrors(error);
        return controllerReplies(h).error(mappedError);
      });
  },

  getSessions(request, h) {
    const certificationCenterId = parseInt(request.params.id);
    const userId = parseInt(request.auth.credentials.userId);

    return usecases.findSessionsForCertificationCenter({ userId, certificationCenterId })
      .then((sessions) => sessionSerializer.serialize(sessions))
      .catch((error) => {
        const mappedError = domainToInfraErrorsConverter.mapToInfrastructureErrors(error);
        return controllerReplies(h).error(mappedError);
      });
  }
};
