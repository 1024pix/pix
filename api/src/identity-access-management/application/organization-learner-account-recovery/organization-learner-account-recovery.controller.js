import { usecases } from '../../domain/usecases/index.js';
import { studentInformationForAccountRecoverySerializer } from '../../infrastructure/serializers/jsonapi/student-information-for-account-recovery.serializer.js';

async function checkScoAccountRecovery(request, h, dependencies = { studentInformationForAccountRecoverySerializer }) {
  const studentInformation = await dependencies.studentInformationForAccountRecoverySerializer.deserialize(
    request.payload,
  );

  const studentInformationForAccountRecovery = await usecases.checkScoAccountRecovery({
    studentInformation,
  });

  return h.response(
    dependencies.studentInformationForAccountRecoverySerializer.serialize(studentInformationForAccountRecovery),
  );
}

const scoOrganizationLearnerController = {
  checkScoAccountRecovery,
};

export { scoOrganizationLearnerController };
