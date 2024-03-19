import { usecases } from '../domain/usecases/index.js';
import * as organizationImportSerializer from '../infrastructure/serializers/jsonapi/organization-import-serializer.js';

const getOrganizationImportStatus = async function (request, h, dependencies = { organizationImportSerializer }) {
  const organizationId = request.params.id;
  const organizationImport = await usecases.getOrganizationImportStatus({
    organizationId,
  });

  return h.response(dependencies.organizationImportSerializer.serialize(organizationImport)).code(200);
};

const organizationImportController = { getOrganizationImportStatus };

export { organizationImportController };
