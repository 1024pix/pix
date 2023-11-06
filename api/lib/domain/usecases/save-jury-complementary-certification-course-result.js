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

  const { partnerKey: pixPartnerKey } = pixSourceComplementaryCertificationCourseResult;

  if (juryLevel === ComplementaryCertificationCourseResult.juryOptions.UNSET) {
    await complementaryCertificationCourseResultRepository.removeExternalJuryResult({
      complementaryCertificationCourseId,
    });
    return;
  }

  const allowedJuryLevels = await complementaryCertificationCourseResultRepository.getAllowedJuryLevelByBadgeKey({
    key: pixPartnerKey,
  });

  if (![...allowedJuryLevels, ComplementaryCertificationCourseResult.juryOptions.REJECTED].includes(juryLevel)) {
    throw new InvalidJuryLevelError();
  }

  const externalComplementaryCertificationCourseResult = ComplementaryCertificationCourseResult.buildFromJuryLevel({
    juryLevel,
    pixPartnerKey,
    complementaryCertificationCourseId,
  });

  return complementaryCertificationCourseResultRepository.save(externalComplementaryCertificationCourseResult);
};

export { saveJuryComplementaryCertificationCourseResult };
