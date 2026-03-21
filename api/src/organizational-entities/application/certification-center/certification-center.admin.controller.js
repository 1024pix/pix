import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import * as csvSerializer from '../../../shared/infrastructure/serializers/csv/csv-serializer.js';
import { generateCSVTemplate } from '../../../shared/infrastructure/serializers/csv/csv-template.js';
import { usecases } from '../../domain/usecases/index.js';
import * as certificationCenterSerializer from '../../infrastructure/serializers/jsonapi/certification-center/certification-center.serializer.js';
import * as certificationCenterForAdminSerializer from '../../infrastructure/serializers/jsonapi/certification-center/certification-center-for-admin.serializer.js';

const archiveCertificationCenter = async function (request, h) {
  const certificationCenterId = request.params.certificationCenterId;
  const { userId } = request.auth.credentials;
  await usecases.archiveCertificationCenter({ certificationCenterId, userId });

  return h.response().code(204);
};

const getTemplateForArchiveInBatch = async function (request, h) {
  const csvTemplateFileContent = generateCSVTemplate(
    csvSerializer.requiredFieldNamesForCertificationCenterBatchArchive,
  );

  return h
    .response(csvTemplateFileContent)
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('content-disposition', 'filename=archive-certification-center-in-batch')
    .code(200);
};

const archiveInBatch = async function (request, h) {
  const { userId } = request.auth.credentials;
  const certificationCenterIds = await csvSerializer.deserializeForCertificationCenterBatchArchive(
    request.payload.path,
  );
  await usecases.archiveCertificationCentersInBatch({ certificationCenterIds, userId });

  return h.response().code(204);
};

const create = async function (request) {
  const { userId } = request.auth.credentials;
  const certificationCenter = certificationCenterForAdminSerializer.deserialize({
    data: request.payload.data,
    createdBy: userId,
  });
  const complementaryCertificationIds =
    request.payload.data.relationships?.habilitations?.data.map(
      (complementaryCertification) => complementaryCertification.id,
    ) || [];
  const createdCertificationCenter = await usecases.createCertificationCenter({
    certificationCenter,
    complementaryCertificationIds,
  });
  return certificationCenterForAdminSerializer.serialize(createdCertificationCenter);
};

const findPaginatedFilteredCertificationCenters = async function (
  request,
  h,
  dependencies = { certificationCenterSerializer },
) {
  const options = request.query;
  const { models: organizations, pagination } = await usecases.findPaginatedFilteredCertificationCenters({
    filter: options.filter,
    page: options.page,
  });

  return dependencies.certificationCenterSerializer.serialize(organizations, pagination);
};

const getCertificationCenterDetails = async function (request) {
  const certificationCenterId = request.params.id;

  const certificationCenterDetails = await usecases.getCenterForAdmin({ id: certificationCenterId });

  return certificationCenterForAdminSerializer.serialize(certificationCenterDetails);
};

const update = async function (request) {
  const certificationCenterId = request.params.id;
  const certificationCenterInformation = certificationCenterForAdminSerializer.deserialize(request.payload);
  const complementaryCertificationIds =
    request.payload.data.relationships?.habilitations?.data.map(
      (complementaryCertification) => complementaryCertification.id,
    ) || [];

  const { updatedCertificationCenter } = await DomainTransaction.execute(
    async () => {
      const updatedCertificationCenter = await usecases.updateCertificationCenter({
        certificationCenterId,
        certificationCenterInformation,
        complementaryCertificationIds,
      });

      return { updatedCertificationCenter };
    },
    { isolationLevel: 'repeatable read' },
  );

  return certificationCenterForAdminSerializer.serialize(updatedCertificationCenter);
};

const certificationCenterAdminController = {
  archiveCertificationCenter,
  getTemplateForArchiveInBatch,
  archiveInBatch,
  create,
  findPaginatedFilteredCertificationCenters,
  getCertificationCenterDetails,
  update,
};

export { certificationCenterAdminController };
