import { usecases } from '../../shared/domain/usecases/index.js';

export const unfinalizeSession = function (request) {
  return usecases.unfinalizeSession(request);
};
