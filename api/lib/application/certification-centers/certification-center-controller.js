const usecases = require('../../domain/usecases');

const certificationCenterSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-serializer');
const certificationCenterMembershipSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-membership-serializer');
const divisionSerializer = require('../../infrastructure/serializers/jsonapi/division-serializer');
const studentCertificationSerializer = require('../../infrastructure/serializers/jsonapi/student-certification-serializer');
const sessionSummarySerializer = require('../../infrastructure/serializers/jsonapi/session-summary-serializer');

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

  async findPaginatedSessionSummaries(request) {
    const certificationCenterId = parseInt(request.params.id);
    const userId = parseInt(request.auth.credentials.userId);
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: sessionSummaries, meta } = await usecases.findPaginatedCertificationCenterSessionSummaries({
      userId,
      certificationCenterId,
      page: options.page,
    });

    return sessionSummarySerializer.serialize(sessionSummaries, meta);
  },

  async getStudents(request) {
    const certificationCenterId = parseInt(request.params.certificationCenterId);
    const sessionId = parseInt(request.params.sessionId);

    const { filter, page } = queryParamsUtils.extractParameters(request.query);
    if (filter.divisions && !Array.isArray(filter.divisions)) {
      filter.divisions = [filter.divisions];
    }

    const { data, pagination } = await usecases.findStudentsForEnrollment({
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

  async findCertificationCenterMembershipsByCertificationCenter(request) {
    const certificationCenterId = parseInt(request.params.certificationCenterId);
    const certificationCenterMemberships = await usecases.findCertificationCenterMembershipsByCertificationCenter({
      certificationCenterId,
    });

    return certificationCenterMembershipSerializer.serialize(certificationCenterMemberships);
  },

  async createCertificationCenterMembershipByEmail(request, h) {
    const certificationCenterId = parseInt(request.params.certificationCenterId);
    const { email } = request.payload;

    const certificationCenterMembership = await usecases.createCertificationCenterMembershipByEmail({
      certificationCenterId,
      email,
    });
    return h.response(certificationCenterMembershipSerializer.serialize(certificationCenterMembership)).created();
  },
};
