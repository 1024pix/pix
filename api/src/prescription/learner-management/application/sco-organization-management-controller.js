import fs from 'node:fs/promises';

import { FileValidationError } from '../../../../src/shared/domain/errors.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { usecases } from '../domain/usecases/index.js';
import { OrganizationLearnerParser } from '../infrastructure/serializers/csv/organization-learner-parser.js';
import * as scoOrganizationLearnerSerializer from '../infrastructure/serializers/jsonapi/sco-organization-learner-serializer.js';

const INVALID_FILE_EXTENSION_ERROR = 'INVALID_FILE_EXTENSION';

const importOrganizationLearnersFromSIECLE = async function (request, h, dependencies = { logger }) {
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
        type: 'FREGATA',
        i18n: request.i18n,
      });
    }
  } catch (error) {
    dependencies.logger.warn(error);

    throw error;
  } finally {
    // see https://hapi.dev/api/?v=21.3.3#-routeoptionspayloadoutput
    // add a catch to avoid an error if unlink fails
    try {
      await fs.unlink(request.payload.path);
    } catch (error) {
      dependencies.logger.error(error);
    }
  }

  return h.response(null).code(204);
};

const reconcileScoOrganizationLearnerManually = async function (
  request,
  h,
  dependencies = { scoOrganizationLearnerSerializer },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const payload = request.payload.data.attributes;
  const organizationId = payload['organization-id'];
  const withReconciliation = request.query.withReconciliation === 'true';

  const reconciliationInfo = {
    id: authenticatedUserId,
    firstName: payload['first-name'],
    lastName: payload['last-name'],
    birthdate: payload['birthdate'],
  };

  const organizationLearner = await usecases.reconcileScoOrganizationLearnerManually({
    organizationId,
    reconciliationInfo,
    withReconciliation,
  });

  let response;
  if (withReconciliation) {
    const serializedData = dependencies.scoOrganizationLearnerSerializer.serializeIdentity(organizationLearner);
    response = h.response(serializedData).code(200);
  } else {
    response = h.response().code(204);
  }
  return response;
};

const scoOrganizationManagementController = {
  importOrganizationLearnersFromSIECLE,
  reconcileScoOrganizationLearnerManually,
};

export { scoOrganizationManagementController };
