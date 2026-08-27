import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UserNotFoundError } from '../../../shared/domain/errors.js';

export async function isAnonymous(userId) {
  const knexConnection = DomainTransaction.getConnection();
  const user = await knexConnection('users').select('isAnonymous').where({ id: userId }).first();
  if (!user) throw new UserNotFoundError();
  return user.isAnonymous;
};

export async function getPixAppLegacyCguByUserId(userId) {
  const knexConnection = DomainTransaction.getConnection();
  const user = await knexConnection('users')
    .select('cgu', 'mustValidateTermsOfService', 'lastTermsOfServiceValidatedAt')
    .where({ id: userId })
    .first();
  if (!user) throw new UserNotFoundError();
  return user;
};

export async function getPixCertifLegacyTosByUserId(userId) {
  const knexConnection = DomainTransaction.getConnection();
  const user = await knexConnection('users')
    .select('pixCertifTermsOfServiceAccepted', 'lastPixCertifTermsOfServiceValidatedAt')
    .where({ id: userId })
    .first();
  if (!user) throw new UserNotFoundError();
  return user;
};

export async function acceptLegacyPixAppTermsOfService(id) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('users').where({ id }).update({
    lastTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    updatedAt: new Date(),
    cgu: true,
  });
}
