import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { usecases } from '../domain/usecases/index.js';

async function neutralizeChallenge(request, h) {
  const { challengeRecId, certificationCourseId } = request.payload.data.attributes;
  const { userId: juryId } = request.auth.credentials;

  await DomainTransaction.execute(async () => {
    const event = await usecases.neutralizeChallenge({
      challengeRecId,
      certificationCourseId,
      juryId,
    });
    await usecases.rescoreV2Certification({ event });
  });

  return h.response().code(204);
}

async function deneutralizeChallenge(request, h) {
  const { challengeRecId, certificationCourseId } = request.payload.data.attributes;
  const { userId: juryId } = request.auth.credentials;

  await DomainTransaction.execute(async () => {
    const event = await usecases.deneutralizeChallenge({
      challengeRecId,
      certificationCourseId,
      juryId,
    });
    await usecases.rescoreV2Certification({ event });
  });

  return h.response().code(204);
}

export const certificationAdminController = {
  neutralizeChallenge,
  deneutralizeChallenge,
};
