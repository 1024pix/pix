import { get } from 'lodash';
import { BadRequestError, sendJsonApiError } from './application/http-errors.js';

function handleFailAction(request, h, err) {
  const message = get(err, 'details[0].message', '');
  return sendJsonApiError(new BadRequestError(message), h);
}

export { handleFailAction };
