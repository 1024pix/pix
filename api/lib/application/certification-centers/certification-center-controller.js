import lodash from 'lodash';

import * as divisionSerializer from '../../../src/prescription/campaign/infrastructure/serializers/jsonapi/division-serializer.js';
import { extractParameters } from '../../../src/shared/infrastructure/utils/query-params-utils.js';
import * as certificationCenterInvitationSerializer from '../../../src/team/infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js';
import { usecases } from '../../domain/usecases/index.js';
import * as certificationCenterForAdminSerializer from '../../infrastructure/serializers/jsonapi/certification-center-for-admin-serializer.js';
import * as certificationCenterMembershipSerializer from '../../infrastructure/serializers/jsonapi/certification-center-membership-serializer.js';
import * as certificationCenterSerializer from '../../infrastructure/serializers/jsonapi/certification-center-serializer.js';
import * as sessionSummarySerializer from '../../infrastructure/serializers/jsonapi/session-summary-serializer.js';
import * as studentCertificationSerializer from '../../infrastructure/serializers/jsonapi/student-certification-serializer.js';

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
  const certificationCenterId = request.params.id;
  const certificationCenterInformation = certificationCenterForAdminSerializer.deserialize(request.payload);
  const complementaryCertificationIds = map(request.payload.data.relationships?.habilitations?.data, 'id');
  const updatedCertificationCenter = await usecases.updateCertificationCenter({
    certificationCenterId,
    certificationCenterInformation,
    complementaryCertificationIds,
  });
  return certificationCenterForAdminSerializer.serialize(updatedCertificationCenter);
};

const getCertificationCenterDetails = async function (request) {
  const certificationCenterId = request.params.id;

  const certificationCenterDetails = await usecases.getCenterForAdmin({ id: certificationCenterId });
  console.log({ certificationCenterDetails });
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
  getStudents,
  update,
  updateReferer,
};

export { certificationCenterController };
