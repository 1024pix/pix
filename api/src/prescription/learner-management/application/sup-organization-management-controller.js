import fs from 'fs';

import { usecases } from '../domain/usecases/index.js';
import * as requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils.js';
import * as supOrganizationLearnerWarningSerializer from '../infrastructure/serializers/jsonapi/sup-organization-learner-warnings-serializer.js';
import { SupOrganizationLearnerParser } from '../infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { importStorage } from '../infrastructure/storage/import-storage.js';
import { logErrorWithCorrelationIds } from '../../../../lib/infrastructure/monitoring-tools.js';

const importSupOrganizationLearners = async function (
  request,
  h,
  dependencies = {
    supOrganizationLearnerWarningSerializer,
    importStorage,
    logErrorWithCorrelationIds,
    unlink: fs.unlink,
  },
) {
  const organizationId = request.params.id;

  const filename = await dependencies.importStorage.sendFile({ filepath: request.payload.path });

  let warnings;
  try {
    const readableStream = await dependencies.importStorage.readFile({ filename });

    warnings = await usecases.importSupOrganizationLearners({ readableStream, organizationId, i18n: request.i18n });
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

const replaceSupOrganizationLearners = async function (
  request,
  h,
  dependencies = {
    requestResponseUtils,
    makeOrganizationLearnerParser,
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

    const supOrganizationLearnerParser = await dependencies.makeOrganizationLearnerParser(
      readableStream,
      organizationId,
      request.i18n,
    );
    warnings = await usecases.replaceSupOrganizationLearners({
      organizationId,
      userId,
      supOrganizationLearnerParser,
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

async function makeOrganizationLearnerParser(readableStream, organizationId, i18n) {
  const buffer = await new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data);
    });
    readableStream.on('error', (err) => reject(err));
    readableStream.once('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
  return new SupOrganizationLearnerParser(buffer, organizationId, i18n);
}

const supOrganizationManagementController = {
  importSupOrganizationLearners,
  replaceSupOrganizationLearners,
};

export { supOrganizationManagementController };
