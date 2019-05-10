const userRepository = require('../../infrastructure/repositories/user-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const areaRepository = require('../../infrastructure/repositories/area-repository');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');

const Profile = require('../models/Profile');

function getByUserId(user_id) {
  const user = userRepository.findUserById(user_id);
  const competences = competenceRepository.list();
  const areas = areaRepository.list();

  const adaptiveCourses = courseRepository.getAdaptiveCourses();
  const lastAssessments = assessmentRepository.findLastAssessmentsForEachCoursesByUser(user_id);
  const assessmentsCompletedWithResults = assessmentRepository.findCompletedAssessmentsByUserId(user_id);
  const organizations = organizationRepository.getByUserId(user_id);
  const usesProfileV2 = assessmentRepository.hasCampaignOrCompetenceEvaluation(user_id);

  return Promise.all([user, competences, areas, lastAssessments, assessmentsCompletedWithResults, adaptiveCourses, organizations, usesProfileV2])
    .then(([user, competences, areas, lastAssessments, assessmentsCompletedWithResults, adaptiveCourses, organizations, usesProfileV2]) => {

      return new Profile({
        user,
        competences,
        areas,
        lastAssessments,
        assessmentsCompletedWithResults,
        courses: adaptiveCourses,
        organizations,
        usesProfileV2
      });
    });
};

module.exports = {
  getByUserId
};
