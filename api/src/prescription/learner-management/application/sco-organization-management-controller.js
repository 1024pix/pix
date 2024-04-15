import fs from 'node:fs/promises';

import { FileValidationError } from '../../../../lib/domain/errors.js';
import { eventBus } from '../../../../lib/domain/events/index.js';
import { logErrorWithCorrelationIds } from '../../../../lib/infrastructure/monitoring-tools.js';
import { ApplicationTransaction } from '../../shared/infrastructure/ApplicationTransaction.js';
import { usecases } from '../domain/usecases/index.js';

const INVALID_FILE_EXTENSION_ERROR = 'INVALID_FILE_EXTENSION';

const importOrganizationLearnersFromSIECLE = async function (
  request,
  h,
  dependencies = { logErrorWithCorrelationIds },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const organizationId = request.params.id;
  const { format } = request.query;
  try {
    if (format === 'xml') {
      await ApplicationTransaction.execute(async () => {
        const uploadedFileEvent = await usecases.uploadSiecleFile({
          userId: authenticatedUserId,
          organizationId,
          payload: request.payload,
        });
        await eventBus.publish(uploadedFileEvent, ApplicationTransaction.getTransactionAsDomainTransaction());
      });
    } else if (format === 'csv') {
      await usecases.importOrganizationLearnersFromSIECLECSVFormat({
        userId: authenticatedUserId,
        organizationId,
        payload: request.payload,
        i18n: request.i18n,
      });
    } else {
      throw new FileValidationError(INVALID_FILE_EXTENSION_ERROR, { fileExtension: format });
    }
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
