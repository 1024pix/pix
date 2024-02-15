import fs from 'fs';

import { usecases } from '../domain/usecases/index.js';
import * as requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils.js';
import * as supOrganizationLearnerWarningSerializer from '../infrastructure/serializers/jsonapi/sup-organization-learner-warnings-serializer.js';
import { SupOrganizationLearnerParser } from '../infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { importStorage } from '../infrastructure/storage/import-storage.js';

const importSupOrganizationLearners = async function (
  request,
  h,
  dependencies = {
    makeOrganizationLearnerParser,
    supOrganizationLearnerWarningSerializer,
    importStorage,
  },
) {
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
    warnings = await usecases.importSupOrganizationLearners({ supOrganizationLearnerParser });
  } finally {
    await dependencies.importStorage.deleteFile({ filename });
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
    createReadStream: fs.createReadStream,
  },
) {
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const organizationId = request.params.id;
  const readableStream = dependencies.createReadStream(request.payload.path);
  const supOrganizationLearnerParser = await dependencies.makeOrganizationLearnerParser(
    readableStream,
    organizationId,
    request.i18n,
  );
  const warnings = await usecases.replaceSupOrganizationLearners({
    organizationId,
    userId,
    supOrganizationLearnerParser,
  });

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
