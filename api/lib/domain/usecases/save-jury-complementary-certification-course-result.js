const { NotFoundError } = require('../errors');
const ComplementaryCertificationCourseResult = require('../models/ComplementaryCertificationCourseResult');

module.exports = async function saveJuryComplementaryCertificationCourseResult({
  complementaryCertificationCourseId,
  juryLevel,
  complementaryCertificationCourseResultRepository,
}) {
  const complementaryCertificationCourseResults =
    await complementaryCertificationCourseResultRepository.getFromComplementaryCertificationCourseId({
      complementaryCertificationCourseId,
    });

  const pixEduAndFromPixSourceComplementaryCertificationCourseResult = complementaryCertificationCourseResults.find(
    (complementaryCertificationCourseResult) =>
      complementaryCertificationCourseResult.isPixEdu() && complementaryCertificationCourseResult.isFromPixSource()
  );

  if (!pixEduAndFromPixSourceComplementaryCertificationCourseResult) {
    throw new NotFoundError("Aucun résultat Pix+ Edu n'a été trouvé pour cette certification.");
  }

  const { partnerKey: pixPartnerKey } = pixEduAndFromPixSourceComplementaryCertificationCourseResult;

  const externalComplementaryCertificationCourseResult = ComplementaryCertificationCourseResult.buildFromJuryLevel({
    juryLevel,
    pixPartnerKey,
    complementaryCertificationCourseId,
  });

  return complementaryCertificationCourseResultRepository.save(externalComplementaryCertificationCourseResult);
};
