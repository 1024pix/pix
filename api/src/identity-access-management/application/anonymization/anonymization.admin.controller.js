import { GarAnonymizationParser } from '../../domain/services/GarAnonymizationParser.js';
import { usecases } from '../../domain/usecases/index.js';
import { anonymizeGarResultSerializer } from '../../infrastructure/serializers/jsonapi/anonymize-gar-result.serializer.js';

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
async function anonymizeGarData(request, h) {
  const filePath = request.payload.path;

  const userIds = await GarAnonymizationParser.getCsvData(filePath);
  const result = await usecases.anonymizeGarAuthenticationMethods({ userIds });

  return h.response(anonymizeGarResultSerializer.serialize(result)).code(200);
}

export const anonymizationAdminController = {
  anonymizeGarData,
};
