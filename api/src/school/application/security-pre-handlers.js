import JSONApi from 'jsonapi-serializer';

import { usecases } from '../domain/usecases/index.js';

export async function checkSchoolSessionIsActive(request, h) {
  const isSessionActive = await usecases.isSchoolSessionActive({ schoolCode: request.query.code });
  if (isSessionActive) {
    return h.response(true);
  }
  return _replyNotFoundError(h);
}

function _replyNotFoundError(h) {
  const errorHttpStatusCode = 404;

  const jsonApiError = new JSONApi.Error({
    code: errorHttpStatusCode,
    title: 'Not found',
  });

  return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
}

export default { checkSchoolSessionIsActive };
