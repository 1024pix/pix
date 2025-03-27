import { extractLocaleFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as frameworkAreasSerializer from '../infrastructure/serializers/jsonapi/framework-areas-serializer.js';
import * as frameworkSerializer from '../infrastructure/serializers/jsonapi/framework-serializer.js';

export async function list() {
  const frameworks = await usecases.listFrameworks();
  return frameworkSerializer.serialize(frameworks);
}

export async function findAreasForFramework(request) {
  const frameworkId = request.params.id;
  const areas = await usecases.findAreasForFrameworkId({ frameworkId });
  return frameworkAreasSerializer.serialize(areas);
}

export async function findPixAreasWithoutThematics(request) {
  const locale = extractLocaleFromRequest(request);
  const areas = await usecases.findAreasForFrameworkName({ frameworkName: 'Pix', locale });
  return frameworkAreasSerializer.serialize(areas, { withoutThematics: true });
}
