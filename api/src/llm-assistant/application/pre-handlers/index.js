import { ServiceUnavailableError } from '../../../shared/application/errors/http-errors.js';
import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';
import { errorSerializer } from '../../../shared/infrastructure/serializers/jsonapi/error-serializer.js';

export async function checkLLMAssistantIsEnabled(request, h) {
  try {
    const isEnabled = await featureToggles.get('isLlmAssistantEnabled');
    if (isEnabled) {
      return h.response(true);
    }
    return replyServiceNotAvailableError(h);
  } catch {
    return replyServiceNotAvailableError(h);
  }
}

function replyServiceNotAvailableError(h) {
  const error = new ServiceUnavailableError(
    'The llm assistant is disabled by the isLlmAssistantEnabled feature toggle',
  );
  return h.response(errorSerializer.serialize(error)).code(error.status).takeover();
}
