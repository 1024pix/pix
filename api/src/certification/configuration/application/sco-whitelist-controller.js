import { usecases } from '../domain/usecases/index.js';
import { extractExternalIds } from '../infrastructure/serializers/csv/sco-whitelist-csv-parser.js';
import { serialize } from '../infrastructure/serializers/csv/sco-whitelist-csv-serializer.js';

async function importScoWhitelist(request, h, dependencies = { extractExternalIds }) {
  const externalIds = await dependencies.extractExternalIds(request.payload.path);
  await usecases.importScoWhitelist({ externalIds });
  return h.response().created();
}

async function exportScoWhitelist(request, h) {
  const whitelist = await usecases.exportScoWhitelist();

  return h
    .response(await serialize({ centers: whitelist }))
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('content-disposition', 'filename=sco-whitelist')
    .code(200);
}

export const scoWhitelistController = {
  importScoWhitelist,
  exportScoWhitelist,
};
