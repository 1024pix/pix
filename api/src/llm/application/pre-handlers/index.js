import { ServiceUnavailableError } from '../../../shared/application/errors/http-errors.js';
import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';
import { errorSerializer } from '../../../shared/infrastructure/serializers/jsonapi/error-serializer.js';

export async function checkLLMChatIsEnabled(request, h) {
  try {
    const isEnabled = await featureToggles.get('isEmbedLLMEnabled');
    if (isEnabled) {
      return h.response(true);
    }
    return replyServiceNotAvailableError(h);
  } catch {
    return replyServiceNotAvailableError(h);
  }
}

function replyServiceNotAvailableError(h) {
  const error = new ServiceUnavailableError();
  return h.response(errorSerializer.serialize(error)).code(error.status).takeover();
}
