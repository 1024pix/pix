import { AssessmentDtoFactory } from '../../domain/models/AssessmentDtoFactory.js';
import { sharedUsecases } from '../../domain/usecases/index.js';
import * as assessmentSerializer from '../../infrastructure/serializers/jsonapi/assessment-serializer.js';
import { extractUserIdFromRequest, getChallengeLocale } from '../../infrastructure/utils/request-response-utils.js';

const getAssessmentWithNextChallenge = async function (request) {
  const assessmentId = request.params.id;
  const locale = getChallengeLocale(request);
  const userId = extractUserIdFromRequest(request);

  const { assessment, globalProgression } = await sharedUsecases.updateAssessmentWithNextChallenge({
    assessmentId,
    userId,
    locale,
  });

  const assessmentDto = AssessmentDtoFactory.toDto(assessment, globalProgression);
  return assessmentSerializer.serialize(assessmentDto);
};

export const assessmentController = {
  getAssessmentWithNextChallenge,
};
