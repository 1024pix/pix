const usecases = require('../../domain/usecases');
const certificationCenterSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-serializer');
const sessionSerializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');

module.exports = {

  save(request) {
    const certificationCenter = certificationCenterSerializer.deserialize(request.payload);
    return usecases.saveCertificationCenter({ certificationCenter })
      .then(certificationCenterSerializer.serialize);
  },

  getById(request) {
    const certificationCenterId = parseInt(request.params.id);
    return usecases.getCertificationCenter({ id: certificationCenterId })
      .then(certificationCenterSerializer.serialize);
  },

  async findPaginatedFilteredCertificationCenters(request) {
    const options = queryParamsUtils.extractParameters(request.query);
    const { models: organizations, pagination } = await usecases.findPaginatedFilteredCertificationCenters({ filter: options.filter, page: options.page });

    return certificationCenterSerializer.serialize(organizations, pagination);
  },

  getSessions(request) {
    const certificationCenterId = parseInt(request.params.id);
    const userId = parseInt(request.auth.credentials.userId);

    return usecases.findPaginatedSessionsForCertificationCenter({ userId, certificationCenterId })
      .then((sessions) => sessionSerializer.serialize(sessions));
  }
};
