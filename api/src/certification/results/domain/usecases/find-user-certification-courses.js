/**
 * @param {object} params
 * @param {number} params.userId
 * @param {import('./index.js').sharedCertificationCourseRepository} params.sharedCertificationCourseRepository
 **/
export async function findUserCertificationCourses({ userId, sharedCertificationCourseRepository }) {
  return sharedCertificationCourseRepository.findAllByUserId({ userId });
}
