import { usecases } from '../domain/usecases/index.js';
import * as organizationImportDetailSerializer from '../infrastructure/serializers/jsonapi/organization-import-detail-serializer.js';

const getOrganizationImportStatus = async function (request, h, dependencies = { organizationImportDetailSerializer }) {
  const { organizationId } = request.params;
  const organizationImportDetail = await usecases.getOrganizationImportStatus({
    organizationId,
  });

  return h.response(dependencies.organizationImportDetailSerializer.serialize(organizationImportDetail)).code(200);
};

const organizationImportController = { getOrganizationImportStatus };

export { organizationImportController };
