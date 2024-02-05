import fs from 'fs/promises';
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
  // see https://hapi.dev/api/?v=21.3.3#-routeoptionspayloadoutput
  request.server.events.on('response', async () => {
    fs.access(request.payload.path).then(
      () => fs.unlink(request.payload.path),
      () => undefined, // nothing to do since file not exists
    );
  });
  return h.response(null).code(204);
};

const scoOrganizationManagementController = {
  importOrganizationLearnersFromSIECLE,
};

export { scoOrganizationManagementController };
