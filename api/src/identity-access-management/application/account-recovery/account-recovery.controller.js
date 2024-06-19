import * as studentInformationForAccountRecoverySerializer from '../../../../lib/infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { usecases } from '../../domain/usecases/index.js';

const checkAccountRecoveryDemand = async function (
  request,
  h,
  dependencies = { studentInformationForAccountRecoverySerializer },
) {
  const temporaryKey = request.params.temporaryKey;
  const studentInformation = await usecases.getAccountRecoveryDetails({ temporaryKey });
  return dependencies.studentInformationForAccountRecoverySerializer.serializeAccountRecovery(studentInformation);
};

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

export const accountRecoveryController = {
  checkAccountRecoveryDemand,
  updateUserAccountFromRecoveryDemand,
};
