import fs from 'fs';

import { usecases } from '../domain/usecases/index.js';
import * as requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils.js';
import * as supOrganizationLearnerWarningSerializer from '../infrastructure/serializers/jsonapi/sup-organization-learner-warnings-serializer.js';
import { importStorage } from '../infrastructure/storage/import-storage.js';
import { logErrorWithCorrelationIds } from '../../../../lib/infrastructure/monitoring-tools.js';

const importSupOrganizationLearners = async function (
  request,
  h,
  dependencies = {
    supOrganizationLearnerWarningSerializer,
    logErrorWithCorrelationIds,
    unlink: fs.unlink,
  },
) {
  const organizationId = request.params.id;

  let warnings;

  try {
    warnings = await usecases.importSupOrganizationLearners({
      payload: request.payload,
      organizationId,
      i18n: request.i18n,
    });
  } finally {
    try {
      dependencies.unlink(request.payload.path);
    } catch (err) {
      dependencies.logErrorWithCorrelationIds(err);
    }
  }

  return h
    .response(dependencies.supOrganizationLearnerWarningSerializer.serialize({ id: organizationId, warnings }))
    .code(200);
};

const replaceSupOrganizationLearners = async function (
  request,
  h,
  dependencies = {
    requestResponseUtils,
    supOrganizationLearnerWarningSerializer,
    importStorage,
    logErrorWithCorrelationIds,
    unlink: fs.unlink,
  },
) {
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const organizationId = request.params.id;

  const filename = await dependencies.importStorage.sendFile({ filepath: request.payload.path });

  let warnings;
  try {
    const readableStream = await dependencies.importStorage.readFile({ filename });

    warnings = await usecases.replaceSupOrganizationLearners({
      readableStream,
      i18n: request.i18n,
      organizationId,
      userId,
    });
  } finally {
    await dependencies.importStorage.deleteFile({ filename });
    // see https://hapi.dev/api/?v=21.3.3#-routeoptionspayloadoutput
    // add a catch to avoid an error if unlink fails
    try {
      dependencies.unlink(request.payload.path);
    } catch (err) {
      dependencies.logErrorWithCorrelationIds(err);
    }
  }

  return h
    .response(dependencies.supOrganizationLearnerWarningSerializer.serialize({ id: organizationId, warnings }))
    .code(200);
};

const supOrganizationManagementController = {
  importSupOrganizationLearners,
  replaceSupOrganizationLearners,
};

export { supOrganizationManagementController };
