import get from 'lodash/get';
import { BadRequestError, sendJsonApiError } from './application/http-errors';

function handleFailAction(request, h, err) {
  const message = get(err, 'details[0].message', '');
  return sendJsonApiError(new BadRequestError(message), h);
}

export default {
  handleFailAction,
};
