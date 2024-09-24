import { usecases } from '../domain/usecases/index.js';
import { extractExternalIds } from '../infrastructure/serializers/csv/sco-whitelist-csv-parser.js';

const importScoWhitelist = async function (request, h, dependencies = { extractExternalIds }) {
  const externalIds = await dependencies.extractExternalIds(request.payload.path);
  await usecases.importScoWhitelist({ externalIds });
  return h.response().created();
};

export const scoWhitelistController = {
  importScoWhitelist,
};
