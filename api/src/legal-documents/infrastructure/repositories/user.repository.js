import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UserNotFoundError } from '../../../shared/domain/errors.js';

const getPixAppLegacyCguByUserId = async (userId) => {
  const knexConnection = DomainTransaction.getConnection();
  const user = await knexConnection('users')
    .select('cgu', 'mustValidateTermsOfService', 'lastTermsOfServiceValidatedAt')
    .where({ id: userId })
    .first();
  if (!user) throw new UserNotFoundError();
  return user;
};

export { getPixAppLegacyCguByUserId };
