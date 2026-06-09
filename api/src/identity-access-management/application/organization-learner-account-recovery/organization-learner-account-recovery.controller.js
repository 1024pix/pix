import { usecases } from '../../domain/usecases/index.js';
import * as studentInformationForAccountRecoverySerializer from '../../infrastructure/serializers/jsonapi/student-information-for-account-recovery.serializer.js';

async function checkScoAccountRecovery(request, h) {
  const studentInformation = await studentInformationForAccountRecoverySerializer.deserialize(request.payload);

  const studentInformationForAccountRecovery = await usecases.checkScoAccountRecovery({
    studentInformation,
  });

  return h.response(studentInformationForAccountRecoverySerializer.serialize(studentInformationForAccountRecovery));
}

export const scoOrganizationLearnerController = {
  checkScoAccountRecovery,
};
