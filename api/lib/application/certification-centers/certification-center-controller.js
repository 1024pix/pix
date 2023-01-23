const usecases = require('../../domain/usecases');

const certificationCenterSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-serializer');
const certificationCenterForAdminSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-for-admin-serializer');
const certificationCenterMembershipSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-membership-serializer');
const divisionSerializer = require('../../infrastructure/serializers/jsonapi/division-serializer');
const studentCertificationSerializer = require('../../infrastructure/serializers/jsonapi/student-certification-serializer');
const sessionSummarySerializer = require('../../infrastructure/serializers/jsonapi/session-summary-serializer');
const certificationCenterInvitationSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-invitation-serializer');
const sessionSerializer = require('../../infrastructure/serializers/jsonapi/session-serializer');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const map = require('lodash/map');
const csvHelpers = require('../../../scripts/helpers/csvHelpers');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');
const { getHeaders } = require('../../infrastructure/files/sessions-import');

module.exports = {
  async saveSession(request) {
    const userId = request.auth.credentials.userId;
    const session = sessionSerializer.deserialize(request.payload);

    const newSession = await usecases.createSession({ userId, session });

    return sessionSerializer.serialize({ session: newSession });
  },

  async create(request) {
    const certificationCenter = certificationCenterForAdminSerializer.deserialize(request.payload);
    const complementaryCertificationIds = map(request.payload.data.relationships?.habilitations?.data, 'id');
    const createdCertificationCenter = await usecases.createCertificationCenter({
      certificationCenter,
      complementaryCertificationIds,
    });
    return certificationCenterForAdminSerializer.serialize(createdCertificationCenter);
  },

  async update(request) {
    const certificationCenter = certificationCenterForAdminSerializer.deserialize(request.payload);
    const complementaryCertificationIds = map(request.payload.data.relationships?.habilitations?.data, 'id');
    const updatedCertificationCenter = await usecases.updateCertificationCenter({
      certificationCenter,
      complementaryCertificationIds,
    });
    return certificationCenterForAdminSerializer.serialize(updatedCertificationCenter);
  },

  async getCertificationCenterDetails(request) {
    const certificationCenterId = request.params.id;

    const certificationCenterDetails = await usecases.getCertificationCenter({ id: certificationCenterId });
    return certificationCenterForAdminSerializer.serialize(certificationCenterDetails);
  },

  async findPaginatedFilteredCertificationCenters(request) {
    const options = queryParamsUtils.extractParameters(request.query);
    const { models: organizations, pagination } = await usecases.findPaginatedFilteredCertificationCenters({
      filter: options.filter,
      page: options.page,
    });

    return certificationCenterSerializer.serialize(organizations, pagination);
  },

  async findPaginatedSessionSummaries(request) {
    const certificationCenterId = request.params.id;
    const userId = request.auth.credentials.userId;
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: sessionSummaries, meta } = await usecases.findPaginatedCertificationCenterSessionSummaries({
      userId,
      certificationCenterId,
      page: options.page,
    });

    return sessionSummarySerializer.serialize(sessionSummaries, meta);
  },

  async getStudents(request) {
    const certificationCenterId = request.params.certificationCenterId;
    const sessionId = request.params.sessionId;

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
    const certificationCenterId = request.params.certificationCenterId;
    const divisions = await usecases.findDivisionsByCertificationCenter({
      certificationCenterId,
    });

    return divisionSerializer.serialize(divisions);
  },

  async findCertificationCenterMembershipsByCertificationCenter(request) {
    const certificationCenterId = request.params.certificationCenterId;
    const certificationCenterMemberships = await usecases.findCertificationCenterMembershipsByCertificationCenter({
      certificationCenterId,
    });

    return certificationCenterMembershipSerializer.serialize(certificationCenterMemberships);
  },

  async findCertificationCenterMemberships(request) {
    const certificationCenterId = request.params.certificationCenterId;
    const certificationCenterMemberships = await usecases.findCertificationCenterMembershipsByCertificationCenter({
      certificationCenterId,
    });

    return certificationCenterMembershipSerializer.serializeMembers(certificationCenterMemberships);
  },

  async createCertificationCenterMembershipByEmail(request, h) {
    const certificationCenterId = request.params.certificationCenterId;
    const { email } = request.payload;

    const certificationCenterMembership = await usecases.createCertificationCenterMembershipByEmail({
      certificationCenterId,
      email,
    });
    return h.response(certificationCenterMembershipSerializer.serialize(certificationCenterMembership)).created();
  },

  async findPendingInvitationsForAdmin(request, h) {
    const certificationCenterId = request.params.certificationCenterId;

    const certificationCenterInvitations = await usecases.findPendingCertificationCenterInvitations({
      certificationCenterId,
    });
    return h.response(certificationCenterInvitationSerializer.serializeForAdmin(certificationCenterInvitations));
  },

  async updateReferer(request, h) {
    const certificationCenterId = request.params.certificationCenterId;
    const { userId, isReferer } = request.payload.data.attributes;

    await usecases.updateCertificationCenterReferer({
      userId,
      certificationCenterId,
      isReferer,
    });
    return h.response().code(204);
  },

  async sendInvitationForAdmin(request, h) {
    const certificationCenterId = request.params.certificationCenterId;
    const invitationInformation = await certificationCenterInvitationSerializer.deserializeForAdmin(request.payload);

    const { certificationCenterInvitation, isInvitationCreated } =
      await usecases.createOrUpdateCertificationCenterInvitationForAdmin({
        email: invitationInformation.email,
        locale: invitationInformation.language,
        certificationCenterId,
      });

    const serializedCertificationCenterInvitation =
      certificationCenterInvitationSerializer.serializeForAdmin(certificationCenterInvitation);
    if (isInvitationCreated) {
      return h.response(serializedCertificationCenterInvitation).created();
    }
    return h.response(serializedCertificationCenterInvitation);
  },

  getSessionsImportTemplate(_, h) {
    const headers = getHeaders();
    return h
      .response(headers)
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('content-disposition', 'filename=import-sessions')
      .code(200);
  },

  async importSessions(request, h) {
    const certificationCenterId = request.params.certificationCenterId;
    const parsedCsvData = await csvHelpers.parseCsvWithHeader(request.payload.path);
    const sessions = csvSerializer.deserializeForSessionsImport(parsedCsvData);
    await usecases.createSessions({ sessions, certificationCenterId });
    return h.response().code(200);
  },
};
