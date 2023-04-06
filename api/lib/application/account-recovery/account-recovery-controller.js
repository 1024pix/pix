import { usecases } from '../../domain/usecases/index.js';
import * as studentInformationForAccountRecoverySerializer from '../../infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';

const sendEmailForAccountRecovery = async function (
  request,
  h,
  dependencies = { studentInformationForAccountRecoverySerializer }
) {
  const studentInformation = await dependencies.studentInformationForAccountRecoverySerializer.deserialize(
    request.payload
  );

  await usecases.sendEmailForAccountRecovery({ studentInformation });

  return h.response().code(204);
};

const checkAccountRecoveryDemand = async function (
  request,
  h,
  dependencies = { studentInformationForAccountRecoverySerializer }
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

export { sendEmailForAccountRecovery, checkAccountRecoveryDemand, updateUserAccountFromRecoveryDemand };
