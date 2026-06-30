import { AssessmentDtoFactory } from '../../domain/models/AssessmentDtoFactory.js';
import { sharedUsecases } from '../../domain/usecases/index.js';
import { assessmentSerializer } from '../../infrastructure/serializers/jsonapi/assessment-serializer.js';
import { extractUserIdFromRequest, getChallengeLocale } from '../../infrastructure/utils/request-response-utils.js';

const getAssessmentWithNextChallenge = async function (
  request,
  h,
  dependencies = { assessmentSerializer, extractUserIdFromRequest },
) {
  const assessmentId = request.params.id;
  const locale = getChallengeLocale(request);
  const userId = dependencies.extractUserIdFromRequest(request);

  const { assessment, globalProgression } = await sharedUsecases.updateAssessmentWithNextChallenge({
    assessmentId,
    userId,
    locale,
  });

  const assessmentDto = AssessmentDtoFactory.toDto(assessment, globalProgression);
  return dependencies.assessmentSerializer.serialize(assessmentDto);
};

const assessmentController = {
  getAssessmentWithNextChallenge,
};

export { assessmentController };
