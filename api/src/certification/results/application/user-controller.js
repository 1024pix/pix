import { usecases } from '../domain/usecases/index.js';
import * as userCertificationCoursesSerializer from '../infrastructure/serializers/user-certification-courses-serializer.js';

async function findAllCertificationCourses(
  request,
  h,
  dependencies = {
    userCertificationCoursesSerializer,
  },
) {
  const userId = request.params.userId;
  const userCertificationCourses = await usecases.findUserCertificationCourses({ userId });
  return dependencies.userCertificationCoursesSerializer.serialize(userCertificationCourses);
}

export const userController = {
  findAllCertificationCourses,
};
