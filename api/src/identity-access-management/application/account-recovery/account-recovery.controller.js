import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { usecases } from '../../domain/usecases/index.js';

const updateUserAccountFromRecoveryDemand = async function (request, h) {
  const temporaryKey = request.payload.data.attributes['temporary-key'];
  const password = request.payload.data.attributes.password;

  await DomainTransaction.execute(async (domainTransaction) => {
    await usecases.updateUserForAccountRecovery({
      password,
      temporaryKey,
      domainTransaction,
    });
  });

  return h.response().code(204);
};

export const accountRecoveryController = { updateUserAccountFromRecoveryDemand };
