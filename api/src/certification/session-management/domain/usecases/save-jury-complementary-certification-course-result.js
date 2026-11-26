import { InvalidJuryLevelError, NotFoundError } from '../../../../shared/domain/errors.js';
import { ComplementaryCertificationCourseResult } from '../../../shared/domain/models/ComplementaryCertificationCourseResult.js';

export async function saveJuryComplementaryCertificationCourseResult({
  complementaryCertificationCourseId,
  juryLevel,
  complementaryCertificationCourseResultRepository,
  complementaryCertificationCourseRepository,
  certificationResultAdapter,
}) {
  const pixSourceComplementaryCertificationCourseResult =
    await complementaryCertificationCourseResultRepository.getPixSourceResultByComplementaryCertificationCourseId({
      complementaryCertificationCourseId,
    });

  if (!pixSourceComplementaryCertificationCourseResult) {
    throw new NotFoundError(
      "Aucun résultat de certification Pix n'a été trouvé pour cette certification complémentaire.",
    );
  }

  if (juryLevel === ComplementaryCertificationCourseResult.juryOptions.UNSET) {
    await complementaryCertificationCourseResultRepository.removeExternalJuryResult({
      complementaryCertificationCourseId,
    });
    await updateCertificationResult({
      complementaryCertificationCourseId,
      v2EduVoletExterneBadgeId: null,
      v2EduVoletExterneAcquired: null,
      complementaryCertificationCourseRepository,
      certificationResultAdapter,
    });
    return;
  }

  const { complementaryCertificationBadgeId } = pixSourceComplementaryCertificationCourseResult;
  const allowedJuryLevels =
    await complementaryCertificationCourseResultRepository.getAllowedJuryLevelIdsByComplementaryCertificationBadgeId({
      complementaryCertificationBadgeId,
    });

  if (![...allowedJuryLevels, ComplementaryCertificationCourseResult.juryOptions.REJECTED].includes(juryLevel)) {
    throw new InvalidJuryLevelError();
  }

  const externalComplementaryCertificationCourseResult = ComplementaryCertificationCourseResult.buildFromJuryLevel({
    juryLevel,
    complementaryCertificationBadgeId,
    complementaryCertificationCourseId,
  });

  await complementaryCertificationCourseResultRepository.save(externalComplementaryCertificationCourseResult);
  await updateCertificationResult({
    complementaryCertificationCourseId,
    v2EduVoletExterneBadgeId: externalComplementaryCertificationCourseResult.complementaryCertificationBadgeId,
    v2EduVoletExterneAcquired: externalComplementaryCertificationCourseResult.acquired,
    complementaryCertificationCourseRepository,
    certificationResultAdapter,
  });
}

async function updateCertificationResult({
  complementaryCertificationCourseId,
  v2EduVoletExterneBadgeId,
  v2EduVoletExterneAcquired,
  complementaryCertificationCourseRepository,
  certificationResultAdapter,
}) {
  const certificationCourseId = await complementaryCertificationCourseRepository.getCertificationCourseId({
    complementaryCertificationCourseId,
  });
  await certificationResultAdapter.updateEduV2ExternalJuryResult({
    certificationCourseId,
    v2EduVoletExterneBadgeId,
    v2EduVoletExterneAcquired,
  });
}
