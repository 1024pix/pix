import fs from 'fs';

import { logErrorWithCorrelationIds } from '../../../../lib/infrastructure/monitoring-tools.js';
import * as requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as supOrganizationLearnerWarningSerializer from '../infrastructure/serializers/jsonapi/sup-organization-learner-warnings-serializer.js';

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
    supOrganizationLearnerWarningSerializer,
    requestResponseUtils,
    logErrorWithCorrelationIds,
    unlink: fs.unlink,
  },
) {
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const organizationId = request.params.id;

  let warnings;
  try {
    warnings = await usecases.replaceSupOrganizationLearners({
      payload: request.payload,
      i18n: request.i18n,
      organizationId,
      userId,
    });
  } finally {
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
