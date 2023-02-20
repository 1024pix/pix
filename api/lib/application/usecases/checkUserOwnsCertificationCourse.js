import certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository';

export default {
  async execute({ userId, certificationCourseId }) {
    const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
    return certificationCourse.doesBelongTo(userId);
  },
};
