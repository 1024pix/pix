import { generateCSVTemplate } from '../../../shared/infrastructure/serializers/csv/csv-template.js';
import { GarAnonymizationParser } from '../../domain/services/GarAnonymizationParser.js';
import { usecases } from '../../domain/usecases/index.js';
import { anonymizeGarResultSerializer } from '../../infrastructure/serializers/jsonapi/anonymize-gar-result.serializer.js';

const ANONYMIZE_GAR_DATA_HEADER = GarAnonymizationParser.CSV_HEADER;

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
async function anonymizeGarData(request, h) {
  const filePath = request.payload.path;
  const adminMemberId = request.auth.credentials.userId;

  const userIds = await GarAnonymizationParser.getCsvData(filePath);

  const result = await usecases.anonymizeGarAuthenticationMethods({ userIds, adminMemberId });

  return h.response(anonymizeGarResultSerializer.serialize(result)).code(200);
}

const getTemplateForAnonymizeGarData = async function (request, h) {
  const fields = ANONYMIZE_GAR_DATA_HEADER.columns.map(({ name }) => name);

  const csvTemplateFileContent = await generateCSVTemplate(fields);

  return h
    .response(csvTemplateFileContent)
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('content-disposition', 'filename=anonymize-gar-data')
    .code(200);
};

export const anonymizationAdminController = {
  anonymizeGarData,
  getTemplateForAnonymizeGarData,
};
