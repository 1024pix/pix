const courseRepository = require('../../infrastructure/repositories/course-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const skillRepository = require('../../infrastructure/repositories/skill-repository');
const assessmentAdapter = require('../../infrastructure/adapters/assessment-adapter');

const answerService = require('../services/answer-service');
const assessmentUtils = require('./assessment-service-utils');
const _ = require('../../infrastructure/utils/lodash-utils');

const { NotFoundError, NotElligibleToScoringError } = require('../../domain/errors');

function _selectNextInAdaptiveMode(assessmentPix, coursePix) {

  let answersPix, challengesPix;

  const competenceId = coursePix.competences[0];

  return answerRepository.findByAssessment(assessmentPix.get('id'))
    .then(answers => {
      answersPix = answers;
      return challengeRepository.getFromCompetenceId(competenceId);
    }).then(challenges => {
      challengesPix = challenges;
      return skillRepository.cache.getFromCompetenceId(competenceId);
    }).then(skills => {
      return assessmentUtils.getNextChallengeInAdaptiveCourse(answersPix, challengesPix, skills);
    });
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

function getScoredAssessment(assessmentId) {

  let assessmentPix, answersPix, challengesPix, coursePix, competenceId, skills;

  return assessmentRepository
    .get(assessmentId)
    .then(retrievedAssessment => {

      if (retrievedAssessment === null) {
        return Promise.reject(new NotFoundError(`Unable to find assessment with ID ${assessmentId}`));
      } else if (isPreviewAssessment(retrievedAssessment)) {
        return Promise.reject(new NotElligibleToScoringError(`Assessment with ID ${assessmentId} is a preview Challenge`));
      }

      assessmentPix = retrievedAssessment;

      return answerRepository.findByAssessment(assessmentPix.get('id'));
    })
    .then(retrievedAnswers => {
      answersPix = retrievedAnswers;

      assessmentPix.set('successRate', answerService.getAnswersSuccessRate(retrievedAnswers));

      return courseRepository.get(assessmentPix.get('courseId'));
    })
    .then(course => {
      coursePix = course;
      competenceId = coursePix.competences[0];
      return challengeRepository.getFromCompetenceId(competenceId);
    })
    .then(challenges => {
      challengesPix = challenges;
      return skillRepository.cache.getFromCompetenceId(competenceId);
    })
    .then(skillNames => {
      if (coursePix.isAdaptive) {
        const assessment = assessmentAdapter.getAdaptedAssessment(answersPix, challengesPix, skillNames);
        skills = {
          assessmentId,
          validatedSkills: assessment.validatedSkills,
          failedSkills: assessment.failedSkills
        };
        assessmentPix.set('estimatedLevel', assessment.obtainedLevel);
        assessmentPix.set('pixScore', assessment.displayedPixScore);
      } else {
        assessmentPix.set('estimatedLevel', 0);
        assessmentPix.set('pixScore', 0);
      }

      return { assessmentPix, skills };
    });
}

function getAssessmentNextChallengeId(assessment, currentChallengeId) {

  return new Promise((resolve, reject) => {

    if (!assessment) {
      resolve(null);
    }

    if (!assessment.get('courseId')) {
      resolve(null);
    }

    if (_.startsWith(assessment.get('courseId'), 'null')) {
      resolve(null);
    }

    const courseId = assessment.get('courseId');
    courseRepository
      .get(courseId)
      .then((course) => resolve(_selectNextChallengeId(course, currentChallengeId, assessment)))
      .catch((error) => reject(error));
  });
}

function isPreviewAssessment(assessment) {
  return _.startsWith(assessment.get('courseId'), 'null');
}

module.exports = {

  getAssessmentNextChallengeId,
  getScoredAssessment,
  isPreviewAssessment

};
