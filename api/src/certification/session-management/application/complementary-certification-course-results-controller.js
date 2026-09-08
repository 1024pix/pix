import { usecases } from '../domain/usecases/index.js';

async function saveJuryComplementaryCertificationCourseResult(request, h) {
  const { complementaryCertificationCourseId, juryLevel } = request.payload.data.attributes;

  await usecases.saveJuryComplementaryCertificationCourseResult({
    complementaryCertificationCourseId,
    juryLevel,
  });
  return h.response().code(200);
}

export const complementaryCertificationCourseResultsController = { saveJuryComplementaryCertificationCourseResult };
