const usecases = require('../../domain/usecases/index.js');

const certificationCenterSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-serializer.js');
const certificationCenterForAdminSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-for-admin-serializer.js');
const certificationCenterMembershipSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-membership-serializer.js');
const divisionSerializer = require('../../infrastructure/serializers/jsonapi/division-serializer.js');
const studentCertificationSerializer = require('../../infrastructure/serializers/jsonapi/student-certification-serializer.js');
const sessionSummarySerializer = require('../../infrastructure/serializers/jsonapi/session-summary-serializer.js');
const certificationCenterInvitationSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js');
const sessionSerializer = require('../../infrastructure/serializers/jsonapi/session-serializer.js');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils.js');
const map = require('lodash/map');
const csvHelpers = require('../../../scripts/helpers/csvHelpers.js');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer.js');
const { getHeaders } = require('../../infrastructure/files/sessions-import.js');

module.exports = {
  async saveSession(request, _h, dependencies = { sessionSerializer }) {
    const userId = request.auth.credentials.userId;
    const session = dependencies.sessionSerializer.deserialize(request.payload);

    const newSession = await usecases.createSession({ userId, session });

    return dependencies.sessionSerializer.serialize({ session: newSession });
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

    const certificationCenterDetails = await usecases.getCertificationCenterForAdmin({ id: certificationCenterId });
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

  async findCertificationCenterMembershipsByCertificationCenter(
    request,
    h,
    dependencies = { certificationCenterMembershipSerializer }
  ) {
    const certificationCenterId = request.params.certificationCenterId;
    const certificationCenterMemberships = await usecases.findCertificationCenterMembershipsByCertificationCenter({
      certificationCenterId,
    });

    return dependencies.certificationCenterMembershipSerializer.serialize(certificationCenterMemberships);
  },

  async findCertificationCenterMemberships(request, h, dependencies = { certificationCenterMembershipSerializer }) {
    const certificationCenterId = request.params.certificationCenterId;
    const certificationCenterMemberships = await usecases.findCertificationCenterMembershipsByCertificationCenter({
      certificationCenterId,
    });

    return dependencies.certificationCenterMembershipSerializer.serializeMembers(certificationCenterMemberships);
  },

  async createCertificationCenterMembershipByEmail(
    request,
    h,
    dependencies = { certificationCenterMembershipSerializer }
  ) {
    const certificationCenterId = request.params.certificationCenterId;
    const { email } = request.payload;

    const certificationCenterMembership = await usecases.createCertificationCenterMembershipByEmail({
      certificationCenterId,
      email,
    });
    return h
      .response(dependencies.certificationCenterMembershipSerializer.serialize(certificationCenterMembership))
      .created();
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

  async sendInvitationForAdmin(request, h, dependencies = { certificationCenterInvitationSerializer }) {
    const certificationCenterId = request.params.certificationCenterId;
    const invitationInformation = await certificationCenterInvitationSerializer.deserializeForAdmin(request.payload);

    const { certificationCenterInvitation, isInvitationCreated } =
      await usecases.createOrUpdateCertificationCenterInvitationForAdmin({
        email: invitationInformation.email,
        locale: invitationInformation.language,
        certificationCenterId,
      });

    const serializedCertificationCenterInvitation =
      dependencies.certificationCenterInvitationSerializer.serializeForAdmin(certificationCenterInvitation);
    if (isInvitationCreated) {
      return h.response(serializedCertificationCenterInvitation).created();
    }
    return h.response(serializedCertificationCenterInvitation);
  },

  async getSessionsImportTemplate(request, h) {
    const certificationCenterId = request.params.certificationCenterId;
    const habilitationLabels = await usecases.getImportSessionComplementaryCertificationHabilitationsLabels({
      certificationCenterId,
    });
    const certificationCenter = await usecases.getCertificationCenter({ id: certificationCenterId });
    const headers = getHeaders({
      habilitationLabels,
      shouldDisplayBillingModeColumns: certificationCenter.hasBillingMode,
    });
    return h
      .response(headers)
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('content-disposition', 'filename=import-sessions')
      .code(200);
  },

  async validateSessionsForMassImport(request, h, dependencies = { csvHelpers, csvSerializer }) {
    const certificationCenterId = request.params.certificationCenterId;
    const authenticatedUserId = request.auth.credentials.userId;

    const parsedCsvData = await dependencies.csvHelpers.parseCsvWithHeader(request.payload.path);

    const sessions = dependencies.csvSerializer.deserializeForSessionsImport(parsedCsvData);
    const sessionMassImportReport = await usecases.validateSessions({
      sessions,
      certificationCenterId,
      userId: authenticatedUserId,
    });
    return h.response(sessionMassImportReport).code(200);
  },

  async createSessionsForMassImport(request, h) {
    const { certificationCenterId } = request.params;
    const authenticatedUserId = request.auth.credentials.userId;

    const { cachedValidatedSessionsKey } = request.payload.data.attributes;

    await usecases.createSessions({
      cachedValidatedSessionsKey,
      certificationCenterId,
      userId: authenticatedUserId,
    });
    return h.response().code(201);
  },
};
