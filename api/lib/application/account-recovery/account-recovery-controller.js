import { usecases } from '../../domain/usecases/index.js';
import * as studentInformationForAccountRecoverySerializer from '../../infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer.js';

const sendEmailForAccountRecovery = async function (
  request,
  h,
  dependencies = { studentInformationForAccountRecoverySerializer },
) {
  const studentInformation = await dependencies.studentInformationForAccountRecoverySerializer.deserialize(
    request.payload,
  );

  await usecases.sendEmailForAccountRecovery({ studentInformation });

  return h.response().code(204);
};

const checkAccountRecoveryDemand = async function (
  request,
  h,
  dependencies = { studentInformationForAccountRecoverySerializer },
) {
  const temporaryKey = request.params.temporaryKey;
  const studentInformation = await usecases.getAccountRecoveryDetails({ temporaryKey });
  return dependencies.studentInformationForAccountRecoverySerializer.serializeAccountRecovery(studentInformation);
};

export const accountRecoveryController = {
  sendEmailForAccountRecovery,
  checkAccountRecoveryDemand,
};
