import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
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
  const adminMemberId = request.auth.credentials.userId;

  const userIds = await GarAnonymizationParser.getCsvData(filePath);

  const result = await DomainTransaction.execute(async () => {
    return await usecases.anonymizeGarAuthenticationMethods({ userIds, adminMemberId });
  });

  return h.response(anonymizeGarResultSerializer.serialize(result)).code(200);
}

export const anonymizationAdminController = {
  anonymizeGarData,
};
