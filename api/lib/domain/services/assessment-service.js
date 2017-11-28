const courseRepository = require('../../infrastructure/repositories/course-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const skillRepository = require('../../infrastructure/repositories/skill-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const assessmentAdapter = require('../../infrastructure/adapters/assessment-adapter');
const answerService = require('../services/answer-service');
const assessmentUtils = require('./assessment-service-utils');
const _ = require('../../infrastructure/utils/lodash-utils');

const { NotFoundError } = require('../../domain/errors');

function _selectNextInAdaptiveMode(assessment, course) {

  let answers, challenges, competence;

  return answerRepository.findByAssessment(assessment.get('id'))
    .then(fetchedAnswers => (answers = fetchedAnswers))
    .then(() => competenceRepository.get(course.competences[0]))
    .then((fetchedCompetence) => (competence = fetchedCompetence))
    .then(() => challengeRepository.findByCompetence(competence))
    .then(fetchedChallenges => (challenges = fetchedChallenges))
    .then(() => skillRepository.findByCompetence(competence))
    .then(skills => assessmentUtils.getNextChallengeInAdaptiveCourse(answers, challenges, skills));
}

function _selectNextInNormalMode(currentChallengeId, challenges) {

  /*
   * example : - if challenges is ["1st_challenge", "2nd_challenge", "3rd_challenge", "4th_challenge"]
   *           - and currentChallengeId is "2nd_challenge"
   *
   *           nextChallengeId will be "3rd_challenge"
   */
  const nextChallengeId = _(challenges).elementAfter(currentChallengeId).value();
  return _.defaultTo(nextChallengeId, null); // result MUST be null if not found

}

function _selectNextChallengeId(course, currentChallengeId, assessment) {

  const challenges = course.challenges;

  if (course.isAdaptive) {
    return Promise.resolve(_selectNextInAdaptiveMode(assessment, course));
  }

  if (!currentChallengeId) { // no currentChallengeId means the test has not yet started
    return Promise.resolve(challenges[0]);
  }

  return Promise.resolve(_selectNextInNormalMode(currentChallengeId, challenges));
}

function getAssessmentNextChallengeId(assessment, currentChallengeId) {

  return new Promise((resolve, reject) => {

    if (!assessment) {
      resolve(null);
    }

    const courseId = assessment.get('courseId');

    if (!courseId) {
      resolve(null);
    }

    if (_.startsWith(courseId, 'null')) {
      resolve(null);
    }

    courseRepository.get(courseId)
      .then(course => resolve(_selectNextChallengeId(course, currentChallengeId, assessment)))
      .catch(reject);
  });
}

async function getScoredAssessment(assessmentId) {

  let skills;

  const [assessmentPix, answers] = await Promise.all([
    assessmentRepository.get(assessmentId),
    answerRepository.findByAssessment(assessmentId)
  ]);

  if (assessmentPix === null) {
    return Promise.reject(new NotFoundError(`Unable to find assessment with ID ${assessmentId}`));
  }

  assessmentPix.set('estimatedLevel', 0);
  assessmentPix.set('pixScore', 0);
  assessmentPix.set('successRate', answerService.getAnswersSuccessRate(answers));

  if (isPreviewAssessment(assessmentPix)) {
    return Promise.resolve({ assessmentPix, skills });
  }

  return courseRepository.get(assessmentPix.get('courseId'))
    .then((course) => {

      if (course.isAdaptive) {
        return competenceRepository
          .get(course.competences[0])
          .then(competencePix => Promise.all([
            skillRepository.findByCompetence(competencePix),
            challengeRepository.findByCompetence(competencePix)
          ]));
      }

      return null;
    })
    .then((skillsAndChallenges) => {

      if(skillsAndChallenges) {
        const [skillNames, challengesPix] = skillsAndChallenges;
        const catAssessment = assessmentAdapter.getAdaptedAssessment(answers, challengesPix, skillNames);

        skills = {
          assessmentId,
          validatedSkills: catAssessment.validatedSkills,
          failedSkills: catAssessment.failedSkills
        };

        assessmentPix.set('estimatedLevel', catAssessment.obtainedLevel);
        assessmentPix.set('pixScore', catAssessment.displayedPixScore);
      }

      return Promise.resolve({ assessmentPix, skills });
    });
}

function isPreviewAssessment(assessment) {
  return _.startsWith(assessment.get('courseId'), 'null');
}

function createCertificationAssessmentForUser(certificationCourse, userId) {
  const assessmentCertification = {
    type: 'CERTIFICATION',
    courseId: certificationCourse.id,
    userId: userId
  };

  return assessmentRepository.save(assessmentCertification);
}

function isAssessmentCompleted(assessment) {
  if (_.isNil(assessment.get('estimatedLevel')) || _.isNil(assessment.get('pixScore'))) {
    return false;
  }

  return true;
}

module.exports = {
  getAssessmentNextChallengeId,
  getScoredAssessment,
  createCertificationAssessmentForUser,
  isAssessmentCompleted
};
