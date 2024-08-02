import * as csvSerializer from '../../../shared/infrastructure/serializers/csv/csv-serializer.js';
import * as csvHelpers from '../../shared/application/helpers/csvHelpers.js';
import { usecases } from '../domain/usecases/index.js';
import { getCsvHeaders } from '../infrastructure/files/sessions-import.js';

const createSessions = async function (request, h) {
  const { certificationCenterId } = request.params;
  const authenticatedUserId = request.auth.credentials.userId;

  const { cachedValidatedSessionsKey } = request.payload.data.attributes;

  await usecases.createSessions({
    cachedValidatedSessionsKey,
    certificationCenterId,
    userId: authenticatedUserId,
  });
  return h.response().code(201);
};

const validateSessions = async function (request, h, dependencies = { csvHelpers, csvSerializer }) {
  const certificationCenterId = request.params.certificationCenterId;
  const authenticatedUserId = request.auth.credentials.userId;

  const parsedCsvData = await dependencies.csvHelpers.parseCsvWithHeader(request.payload.path);

  const certificationCenter = await usecases.getCertificationCenter({ id: certificationCenterId });

  const sessions = dependencies.csvSerializer.deserializeForSessionsImport({
    parsedCsvData,
    hasBillingMode: certificationCenter.hasBillingMode,
    certificationCenterHabilitations: certificationCenter.habilitations,
  });

  const sessionMassImportReport = await usecases.validateSessions({
    sessions,
    certificationCenterId,
    userId: authenticatedUserId,
    i18n: request.i18n,
  });
  return h.response(sessionMassImportReport).code(200);
};

const getTemplate = async function (request, h) {
  const { habilitationLabels, shouldDisplayBillingModeColumns } = await usecases.getMassImportTemplateInformation({
    centerId: request.params.certificationCenterId,
  });
  const csvTemplateFileContent = getCsvHeaders({
    habilitationLabels,
    shouldDisplayBillingModeColumns,
  });
  return h
    .response(csvTemplateFileContent)
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('content-disposition', 'filename=import-sessions')
    .code(200);
};

const sessionMassImportController = {
  createSessions,
  validateSessions,
  getTemplate,
};

export { sessionMassImportController };
