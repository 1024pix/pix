import { getUserLocale } from '../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';

const anonymizeUserByAdmin = async function (request, h) {
  const userToAnonymizeId = request.params.id;
  const adminMemberId = request.auth.credentials.userId;

  await usecases.anonymizeUserByAdmin({
    userId: userToAnonymizeId,
    updatedByUserId: adminMemberId,
  });

  return h.response().code(204);
};

const anonymizeUserByItself = async function (request, h) {
  const authenticatedUserId = request.auth.credentials.userId;
  const locale = getUserLocale(request);

  await usecases.anonymizeUserByItself({
    userId: authenticatedUserId,
    locale,
  });

  return h.response().code(204);
};

export const anonymizeUserController = { anonymizeUserByAdmin, anonymizeUserByItself };
