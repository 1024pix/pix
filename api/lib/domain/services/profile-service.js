const userRepository = require('../../infrastructure/repositories/user-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const areaRepository = require('../../infrastructure/repositories/area-repository');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');

const Profile = require('../../domain/models/data/profile');

const profileService = {
  getByUserId(user_id) {
    const user = userRepository.findUserById(user_id);
    const competences = competenceRepository.list();
    const areas = areaRepository.list();

    const adaptiveCourses = courseRepository.getAdaptiveCourses();
    const assessments = assessmentRepository.getByUserId(user_id);

    return Promise.all([user, competences, areas, assessments, adaptiveCourses])
      .then(([user, competences, areas, assessments, adaptiveCourses]) => {
        return new Profile(user, competences, areas, assessments, adaptiveCourses);
      });
  }
};
module.exports = profileService;
