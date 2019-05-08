const userRepository = require('../../infrastructure/repositories/user-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const areaRepository = require('../../infrastructure/repositories/area-repository');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');

const Profile = require('../models/Profile');

async function getByUserId(user_id) {
  return Promise.all([
    userRepository.findUserById(user_id),
    competenceRepository.list(),
    areaRepository.list(),
    assessmentRepository.findLastAssessmentsForEachCoursesByUser(user_id),
    assessmentRepository.findCompletedAssessmentsByUserId(user_id),
    courseRepository.getAdaptiveCourses(),
    organizationRepository.findByUserId(user_id),
    assessmentRepository.hasCampaignOrCompetenceEvaluation(user_id)
  ])
    .then(([
      user,
      competences,
      areas,
      lastAssessments,
      assessmentsCompletedWithResults,
      courses,
      organizations,
      usesProfileV2

    ]) => new Profile({
      user,
      competences,
      areas,
      lastAssessments,
      assessmentsCompletedWithResults,
      courses,
      organizations,
      usesProfileV2
    }));
}

module.exports = {
  getByUserId
};
