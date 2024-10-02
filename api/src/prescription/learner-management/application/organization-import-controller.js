import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { usecases } from '../domain/usecases/index.js';
import * as organizationImportDetailSerializer from '../infrastructure/serializers/jsonapi/organization-import-detail-serializer.js';

const getOrganizationImportStatus = async function (request, h, dependencies = { organizationImportDetailSerializer }) {
  const { organizationId } = request.params;
  const organizationImportDetail = await usecases.getOrganizationImportStatus({
    organizationId,
  });

  return h.response(dependencies.organizationImportDetailSerializer.serialize(organizationImportDetail)).code(200);
};

const updateOrganizationLearnerImportFormats = async function (request) {
  await DomainTransaction.execute(async () => {
    await usecases.updateOrganizationLearnerImportFormats({ payload: request.payload });
  });

  return null;
};

const organizationImportController = { getOrganizationImportStatus, updateOrganizationLearnerImportFormats };

export { organizationImportController };
