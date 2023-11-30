import { usecases } from '../../domain/usecases/index.js';

import * as certificationCenterSerializer from '../../infrastructure/serializers/jsonapi/certification-center-serializer.js';
import * as certificationCenterForAdminSerializer from '../../infrastructure/serializers/jsonapi/certification-center-for-admin-serializer.js';
import * as certificationCenterMembershipSerializer from '../../infrastructure/serializers/jsonapi/certification-center-membership-serializer.js';
import * as divisionSerializer from '../../infrastructure/serializers/jsonapi/division-serializer.js';
import * as studentCertificationSerializer from '../../infrastructure/serializers/jsonapi/student-certification-serializer.js';
import * as sessionSummarySerializer from '../../infrastructure/serializers/jsonapi/session-summary-serializer.js';
import * as certificationCenterInvitationSerializer from '../../infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js';

import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import lodash from 'lodash';
import { getHeaders } from '../../infrastructure/files/sessions-import.js';
import { extractLocaleFromRequest } from '../../infrastructure/utils/request-response-utils.js';

const { map } = lodash;

const create = async function (request) {
  const certificationCenter = certificationCenterForAdminSerializer.deserialize(request.payload);
  const complementaryCertificationIds = map(request.payload.data.relationships?.habilitations?.data, 'id');
  const createdCertificationCenter = await usecases.createCertificationCenter({
    certificationCenter,
    complementaryCertificationIds,
  });
  return certificationCenterForAdminSerializer.serialize(createdCertificationCenter);
};

const update = async function (request) {
  const certificationCenter = certificationCenterForAdminSerializer.deserialize(request.payload);
  const complementaryCertificationIds = map(request.payload.data.relationships?.habilitations?.data, 'id');
  const updatedCertificationCenter = await usecases.updateCertificationCenter({
    certificationCenter,
    complementaryCertificationIds,
  });
  return certificationCenterForAdminSerializer.serialize(updatedCertificationCenter);
};

const getCertificationCenterDetails = async function (request) {
  const certificationCenterId = request.params.id;

  const certificationCenterDetails = await usecases.getCertificationCenterForAdmin({ id: certificationCenterId });
  return certificationCenterForAdminSerializer.serialize(certificationCenterDetails);
};

const findPaginatedFilteredCertificationCenters = async function (request) {
  const options = extractParameters(request.query);
  const { models: organizations, pagination } = await usecases.findPaginatedFilteredCertificationCenters({
    filter: options.filter,
    page: options.page,
  });

  return certificationCenterSerializer.serialize(organizations, pagination);
};

const findPaginatedSessionSummaries = async function (request) {
  const certificationCenterId = request.params.id;
  const userId = request.auth.credentials.userId;
  const options = extractParameters(request.query);

  const { models: sessionSummaries, meta } = await usecases.findPaginatedCertificationCenterSessionSummaries({
    userId,
    certificationCenterId,
    page: options.page,
  });

  return sessionSummarySerializer.serialize(sessionSummaries, meta);
};

const getStudents = async function (request) {
  const certificationCenterId = request.params.certificationCenterId;
  const sessionId = request.params.sessionId;

  const { filter, page } = extractParameters(request.query);
  if (filter.divisions && !Array.isArray(filter.divisions)) {
    filter.divisions = [filter.divisions];
  }

  const { data, pagination } = await usecases.findStudentsForEnrolment({
    certificationCenterId,
    sessionId,
    page,
    filter,
  });
  return studentCertificationSerializer.serialize(data, pagination);
};

const getDivisions = async function (request) {
  const certificationCenterId = request.params.certificationCenterId;
  const divisions = await usecases.findDivisionsByCertificationCenter({
    certificationCenterId,
  });

  return divisionSerializer.serialize(divisions);
};

const findCertificationCenterMembershipsByCertificationCenter = async function (
  request,
  h,
  dependencies = { certificationCenterMembershipSerializer },
) {
  const certificationCenterId = request.params.certificationCenterId;
  const certificationCenterMemberships = await usecases.findCertificationCenterMembershipsByCertificationCenter({
    certificationCenterId,
  });

  return dependencies.certificationCenterMembershipSerializer.serialize(certificationCenterMemberships);
};

const findCertificationCenterMemberships = async function (
  request,
  h,
  dependencies = { certificationCenterMembershipSerializer },
) {
  const certificationCenterId = request.params.certificationCenterId;
  const certificationCenterMemberships = await usecases.findCertificationCenterMembershipsByCertificationCenter({
    certificationCenterId,
  });

  return dependencies.certificationCenterMembershipSerializer.serializeMembers(certificationCenterMemberships);
};

const createCertificationCenterMembershipByEmail = async function (
  request,
  h,
  dependencies = { certificationCenterMembershipSerializer },
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
};

const findPendingInvitations = async function (request, h) {
  const certificationCenterId = request.params.certificationCenterId;

  const certificationCenterInvitations = await usecases.findPendingCertificationCenterInvitations({
    certificationCenterId,
  });
  return h.response(certificationCenterInvitationSerializer.serializeForAdmin(certificationCenterInvitations));
};

const updateReferer = async function (request, h) {
  const certificationCenterId = request.params.certificationCenterId;
  const { userId, isReferer } = request.payload.data.attributes;

  await usecases.updateCertificationCenterReferer({
    userId,
    certificationCenterId,
    isReferer,
  });
  return h.response().code(204);
};

const sendInvitationForAdmin = async function (request, h, dependencies = { certificationCenterInvitationSerializer }) {
  const certificationCenterId = request.params.certificationCenterId;
  const invitationInformation = await certificationCenterInvitationSerializer.deserializeForAdmin(request.payload);

  const { certificationCenterInvitation, isInvitationCreated } =
    await usecases.createOrUpdateCertificationCenterInvitationForAdmin({
      certificationCenterId,
      email: invitationInformation.email,
      locale: invitationInformation.language,
      role: invitationInformation.role,
    });

  const serializedCertificationCenterInvitation =
    dependencies.certificationCenterInvitationSerializer.serializeForAdmin(certificationCenterInvitation);
  if (isInvitationCreated) {
    return h.response(serializedCertificationCenterInvitation).created();
  }
  return h.response(serializedCertificationCenterInvitation);
};

const getSessionsImportTemplate = async function (request, h) {
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
};

const sendInvitations = async function (request, h) {
  const certificationCenterId = request.params.certificationCenterId;
  const emails = request.payload.data.attributes.emails;
  const locale = extractLocaleFromRequest(request);

  await usecases.createOrUpdateCertificationCenterInvitation({ certificationCenterId, emails, locale });

  return h.response().code(204);
};

const certificationCenterController = {
  create,
  createCertificationCenterMembershipByEmail,
  findCertificationCenterMemberships,
  findCertificationCenterMembershipsByCertificationCenter,
  findPaginatedFilteredCertificationCenters,
  findPaginatedSessionSummaries,
  findPendingInvitations,
  getCertificationCenterDetails,
  getDivisions,
  getSessionsImportTemplate,
  getStudents,
  sendInvitationForAdmin,
  sendInvitations,
  update,
  updateReferer,
};

export { certificationCenterController };
