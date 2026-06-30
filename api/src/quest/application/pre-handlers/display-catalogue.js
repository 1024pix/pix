import { NotFoundError } from '../../../shared/application/errors/http-errors.js';
import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';
import { errorSerializer } from '../../../shared/infrastructure/serializers/jsonapi/error-serializer.js';

export async function checkDisplayCatalogueIsEnabled(request, h) {
  const isEnabled = await featureToggles.get('displayCatalogue');
  if (isEnabled) {
    return h.response(true);
  }
  const error = new NotFoundError();
  return h.response(errorSerializer.serialize(error)).code(error.status).takeover();
}
