import lodash from 'lodash';

import { usecases as certificationConfigurationUsecases } from '../../../src/certification/configuration/domain/usecases/index.js';
import * as divisionSerializer from '../../../src/prescription/campaign/infrastructure/serializers/jsonapi/division-serializer.js';
import { usecases } from '../../domain/usecases/index.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import * as certificationCenterForAdminSerializer from '../../infrastructure/serializers/jsonapi/certification-center-for-admin-serializer.js';
import * as certificationCenterMembershipSerializer from '../../infrastructure/serializers/jsonapi/certification-center-membership-serializer.js';
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

  const { updatedCertificationCenter, certificationCenterPilotFeatures } = await DomainTransaction.execute(
    async () => {
      const updatedCertificationCenter = await usecases.updateCertificationCenter({
        certificationCenterId,
        certificationCenterInformation,
        complementaryCertificationIds,
      });

      const certificationCenterPilotFeatures = await certificationConfigurationUsecases.registerCenterPilotFeatures({
        centerId: updatedCertificationCenter.id,
        isV3Pilot: certificationCenterInformation.isV3Pilot,
      });

      return { updatedCertificationCenter, certificationCenterPilotFeatures };
    },
    { isolationLevel: 'repeatable read' },
  );

  return certificationCenterForAdminSerializer.serialize(updatedCertificationCenter, certificationCenterPilotFeatures);
};

const getCertificationCenterDetails = async function (request) {
  const certificationCenterId = request.params.id;

  const certificationCenterDetails = await usecases.getCenterForAdmin({ id: certificationCenterId });

  return certificationCenterForAdminSerializer.serialize(certificationCenterDetails);
};

const findPaginatedSessionSummaries = async function (request) {
  const certificationCenterId = request.params.id;
  const userId = request.auth.credentials.userId;
  const options = request.query;

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

  const { filter, page } = request.query;
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
  findPaginatedSessionSummaries,
  getCertificationCenterDetails,
  getDivisions,
  getStudents,
  update,
  updateReferer,
};

export { certificationCenterController };
