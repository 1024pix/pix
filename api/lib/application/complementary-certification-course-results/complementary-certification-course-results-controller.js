import { usecases } from '../../domain/usecases/index.js';

const saveJuryComplementaryCertificationCourseResult = async function (request, h) {
  const { complementaryCertificationCourseId, juryLevel } = request.payload.data.attributes;

  await usecases.saveJuryComplementaryCertificationCourseResult({
    complementaryCertificationCourseId,
    juryLevel,
  });
  return h.response().code(200);
};

export { saveJuryComplementaryCertificationCourseResult };
