import fs from 'fs/promises';
import { usecases } from '../domain/usecases/index.js';
import { logErrorWithCorrelationIds } from '../../../../lib/infrastructure/monitoring-tools.js';

const importOrganizationLearnersFromSIECLE = async function (
  request,
  h,
  dependencies = { logErrorWithCorrelationIds },
) {
  const organizationId = request.params.id;
  const { format } = request.query;
  try {
    await usecases.importOrganizationLearnersFromSIECLEFormat({
      organizationId,
      payload: request.payload,
      format,
      i18n: request.i18n,
    });
  } finally {
    // see https://hapi.dev/api/?v=21.3.3#-routeoptionspayloadoutput
    // add a catch to avoid an error if unlink fails
    try {
      await fs.unlink(request.payload.path);
    } catch (err) {
      dependencies.logErrorWithCorrelationIds(err);
    }
  }

  return h.response(null).code(204);
};

const scoOrganizationManagementController = {
  importOrganizationLearnersFromSIECLE,
};

export { scoOrganizationManagementController };
