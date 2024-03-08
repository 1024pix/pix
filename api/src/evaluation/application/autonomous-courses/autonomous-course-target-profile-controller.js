import { evaluationUsecases as usecases } from '../../domain/usecases/index.js';
import * as AutonomousCourseTargetProfilesSerializer from '../../infrastructure/serializers/jsonapi/autonomous-course-target-profiles-serializer.js';

const get = function (
  request,
  h,
  dependencies = { usecases, autonomousCourseTargetProfilesSerializer: AutonomousCourseTargetProfilesSerializer },
) {
  return dependencies.usecases
    .getAutonomousCourseTargetProfiles()
    .then(dependencies.autonomousCourseTargetProfilesSerializer.serialize);
};

const autonomousCourseTargetProfileController = { get };

export { autonomousCourseTargetProfileController };
