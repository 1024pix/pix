import fs from 'node:fs/promises';

import { FileValidationError } from '../../../../src/shared/domain/errors.js';
import {
  logErrorWithCorrelationIds,
  logWarnWithCorrelationIds,
} from '../../../../src/shared/infrastructure/monitoring-tools.js';
import { usecases } from '../domain/usecases/index.js';
import { OrganizationLearnerParser } from '../infrastructure/serializers/csv/organization-learner-parser.js';

const INVALID_FILE_EXTENSION_ERROR = 'INVALID_FILE_EXTENSION';

const importOrganizationLearnersFromSIECLE = async function (
  request,
  h,
  dependencies = { logErrorWithCorrelationIds, logWarnWithCorrelationIds },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const organizationId = request.params.id;
  const userId = request.auth.credentials.userId;
  const { format } = request.query;
  try {
    if (!['xml', 'csv'].includes(format))
      throw new FileValidationError(INVALID_FILE_EXTENSION_ERROR, { fileExtension: format });

    if (format === 'xml') {
      await usecases.uploadSiecleFile({
        userId: authenticatedUserId,
        organizationId,
        payload: request.payload,
      });
    } else if (format === 'csv') {
      await usecases.uploadCsvFile({
        Parser: OrganizationLearnerParser,
        payload: request.payload,
        organizationId,
        userId,
        i18n: request.i18n,
      });
      await usecases.validateCsvFile({
        Parser: OrganizationLearnerParser,
        organizationId,
        i18n: request.i18n,
      });
      await usecases.importOrganizationLearnersFromSIECLECSVFormat({
        userId: authenticatedUserId,
        organizationId,
        payload: request.payload,
        i18n: request.i18n,
      });
    }
  } catch (error) {
    dependencies.logWarnWithCorrelationIds(error);

    throw error;
  } finally {
    // see https://hapi.dev/api/?v=21.3.3#-routeoptionspayloadoutput
    // add a catch to avoid an error if unlink fails
    try {
      await fs.unlink(request.payload.path);
    } catch (error) {
      dependencies.logErrorWithCorrelationIds(error);
    }
  }

  return h.response(null).code(204);
};

const scoOrganizationManagementController = {
  importOrganizationLearnersFromSIECLE,
};

export { scoOrganizationManagementController };
