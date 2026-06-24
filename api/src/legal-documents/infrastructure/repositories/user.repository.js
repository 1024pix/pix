import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UserNotFoundError } from '../../../shared/domain/errors.js';

const isAnonymous = async (userId) => {
  const knexConnection = DomainTransaction.getConnection();
  const user = await knexConnection('users').select('isAnonymous').where({ id: userId }).first();
  if (!user) throw new UserNotFoundError();
  return user.isAnonymous;
};

const getPixAppLegacyCguByUserId = async (userId) => {
  const knexConnection = DomainTransaction.getConnection();
  const user = await knexConnection('users')
    .select('cgu', 'mustValidateTermsOfService', 'lastTermsOfServiceValidatedAt')
    .where({ id: userId })
    .first();
  if (!user) throw new UserNotFoundError();
  return user;
};

const acceptLegacyPixAppTermsOfService = async function (id) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('users').where({ id }).update({
    lastTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    updatedAt: new Date(),
    cgu: true,
  });
};

export { acceptLegacyPixAppTermsOfService, getPixAppLegacyCguByUserId, isAnonymous };
