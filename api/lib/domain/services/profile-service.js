const userRepository = require('../../infrastructure/repositories/user-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const areaRepository = require('../../infrastructure/repositories/area-repository');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');

const Profile = require('../../domain/models/data/profile');

const profileService = {
  getByUserId(user_id) {
    const user = userRepository.findUserById(user_id);
    const competences = competenceRepository.list();
    const areas = areaRepository.list();

    const adaptiveCourses = courseRepository.getAdaptiveCourses();
    const assessments = assessmentRepository.findCompletedAssessmentsByUserId(user_id);
    const organizations = organizationRepository.getByUserId(user_id);

    return Promise.all([user, competences, areas, assessments, adaptiveCourses, organizations])
      .then(([user, competences, areas, assessments, adaptiveCourses, organizations]) => {
        return new Profile(user, competences, areas, assessments, adaptiveCourses, organizations);
      });
  }
};
module.exports = profileService;
