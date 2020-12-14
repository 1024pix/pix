const usecases = require('../../domain/usecases');
const certificationCenterSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-serializer');
const sessionSerializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const studentCertificationSerializer = require('../../infrastructure/serializers/jsonapi/student-certification-serializer');
const divisionSerializer = require('../../infrastructure/serializers/jsonapi/sco-certification-center-division-serializer');
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

    return usecases.findSessionsForCertificationCenter({ userId, certificationCenterId })
      .then((sessions) => sessionSerializer.serialize(sessions));
  },

  async getStudents(request) {
    const userId = parseInt(request.auth.credentials.userId);
    const certificationCenterId = parseInt(request.params.certificationCenterId);
    const sessionId = parseInt(request.params.sessionId);

    const { filter, page } = queryParamsUtils.extractParameters(request.query);
    if (filter.divisions && !Array.isArray(filter.divisions)) {
      filter.divisions = [filter.divisions];
    }

    const { data, pagination } = await usecases.findStudentsForEnrollement(
      {
        userId,
        certificationCenterId,
        sessionId,
        page,
        filter,
      });
    return studentCertificationSerializer.serialize(data, pagination);
  },

  async getDivisions(request) {
    const certificationCenterId = parseInt(request.params.certificationCenterId);
    const divisions = await usecases.findDivisionsByCertificationCenter({
      certificationCenterId,
    });

    return divisionSerializer.serialize(divisions);
  },
};
