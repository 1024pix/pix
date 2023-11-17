import { NotFoundError, InvalidJuryLevelError } from '../errors.js';
import { ComplementaryCertificationCourseResult } from '../models/ComplementaryCertificationCourseResult.js';

const saveJuryComplementaryCertificationCourseResult = async function ({
  complementaryCertificationCourseId,
  juryLevel,
  complementaryCertificationCourseResultRepository,
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
    return;
  }

  const { complementaryCertificationBadgeId } = pixSourceComplementaryCertificationCourseResult;
  const allowedJuryLevels =
    await complementaryCertificationCourseResultRepository.getAllowedJuryLevelIdsByComplementaryCertificationBadgeId(
      complementaryCertificationBadgeId,
    );

  if (![...allowedJuryLevels, ComplementaryCertificationCourseResult.juryOptions.REJECTED].includes(juryLevel)) {
    throw new InvalidJuryLevelError();
  }

  const externalComplementaryCertificationCourseResult = ComplementaryCertificationCourseResult.buildFromJuryLevel({
    juryLevel,
    complementaryCertificationBadgeId,
    complementaryCertificationCourseId,
  });

  return complementaryCertificationCourseResultRepository.save(externalComplementaryCertificationCourseResult);
};

export { saveJuryComplementaryCertificationCourseResult };
