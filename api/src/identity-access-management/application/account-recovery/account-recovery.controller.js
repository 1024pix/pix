import { usecases } from '../../domain/usecases/index.js';
import { accountRecoveryDemandSerializer } from '../../infrastructure/serializers/jsonapi/account-recovery-demand.serializer.js';

const checkAccountRecoveryDemand = async function (request, h, dependencies = { accountRecoveryDemandSerializer }) {
  const temporaryKey = request.params.temporaryKey;
  const accountRecoveryDemand = await usecases.getAccountRecoveryDetails({ temporaryKey });
  return dependencies.accountRecoveryDemandSerializer.serialize(accountRecoveryDemand);
};

const updateUserAccountFromRecoveryDemand = async function (request, h) {
  const temporaryKey = request.payload.data.attributes['temporary-key'];
  const password = request.payload.data.attributes.password;
  await usecases.updateUserForAccountRecovery({ password, temporaryKey });
  return h.response().code(204);
};

export const accountRecoveryController = {
  checkAccountRecoveryDemand,
  updateUserAccountFromRecoveryDemand,
};
