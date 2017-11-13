const userRepository = require('../../infrastructure/repositories/user-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const areaRepository = require('../../infrastructure/repositories/area-repository');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');

const Profile = require('../../domain/models/data/profile');

// FIXME: A déplacer dans le competenceRepository pour qu'il ne renvoit plus des Challenges de Bookshelf (mais objets du domaine).
function _initCompetenceLevel(competences) {
  if (competences) {
    competences.forEach((competence) => {
      competence['level'] = -1;
      competence['status'] = 'notEvaluated';
    });
  }

  return competences;
}

const profileService = {
  getByUserId(user_id) {
    const user = userRepository.findUserById(user_id);
    const competences = competenceRepository.list();
    const areas = areaRepository.list();

    const adaptiveCourses = courseRepository.getAdaptiveCourses();
    const lastAssessments = assessmentRepository.findLastAssessmentsForEachCoursesByUser(user_id);
    const assessmentsCompleted = assessmentRepository.findCompletedAssessmentsByUserId(user_id);
    const organizations = organizationRepository.getByUserId(user_id);

    return Promise.all([user, competences, areas, lastAssessments, assessmentsCompleted, adaptiveCourses, organizations])
      .then(([user, competences, areas, lastAssessments, assessmentsCompleted, adaptiveCourses, organizations]) => {

        const competencesWithDefaultLevelAndStatus = _initCompetenceLevel(competences);

        return new Profile(user, competencesWithDefaultLevelAndStatus, areas, lastAssessments, assessmentsCompleted, adaptiveCourses, organizations);
      });
  }
};
module.exports = profileService;
