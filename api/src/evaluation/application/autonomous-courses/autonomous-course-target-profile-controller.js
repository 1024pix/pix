import { evaluationUsecases as usecases } from '../../domain/usecases/index.js';
import { autonomousCourseTargetProfilesSerializer } from '../../infrastructure/serializers/jsonapi/autonomous-course-target-profiles-serializer.js';

const get = function (
  request,
  h,
  dependencies = { usecases, autonomousCourseTargetProfilesSerializer: autonomousCourseTargetProfilesSerializer },
) {
  return dependencies.usecases
    .getAutonomousCourseTargetProfiles()
    .then(dependencies.autonomousCourseTargetProfilesSerializer.serialize);
};

const autonomousCourseTargetProfileController = { get };

export { autonomousCourseTargetProfileController };
