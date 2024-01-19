import { usecases } from '../domain/usecases/index.js';

const importOrganizationLearnersFromSIECLE = async function (request, h) {
  const organizationId = request.params.id;
  const { format } = request.query;

  await usecases.importOrganizationLearnersFromSIECLEFormat({
    organizationId,
    payload: request.payload,
    format,
    i18n: request.i18n,
  });

  return h.response(null).code(204);
};

const scoOrganizationManagementController = {
  importOrganizationLearnersFromSIECLE,
};

export { scoOrganizationManagementController };
