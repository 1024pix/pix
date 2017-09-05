const courseRepository = require('../../infrastructure/repositories/course-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const skillRepository = require('../../infrastructure/repositories/skill-repository');
const assessmentAdapter = require('../../infrastructure/adapters/assessment-adapter');

const assessmentUtils = require('./assessment-service-utils');
const _ = require('../../infrastructure/utils/lodash-utils');

const { NotFoundError, NotElligibleToScoringError } = require('../../domain/errors');

function _selectNextInAdaptiveMode(assessmentPix, coursePix) {

  return new Promise((resolve, reject) => {
    let answersPix, challengesPix;

    answerRepository.findByAssessment(assessmentPix.get('id'))
      .then(answers => {
        answersPix = answers;

        const challengePromises = coursePix.challenges.map(challengeId => challengeRepository.get(challengeId));
        return Promise.all(challengePromises);
      }).then(challenges => {
        challengesPix = challenges;

        const competenceId = coursePix.competences[0];
        return skillRepository.getFromCompetence(competenceId);
      }).then(skillNames => {
        return assessmentUtils.getNextChallengeInAdaptiveCourse(coursePix, answersPix, challengesPix, skillNames);
      })
      .then(resolve)
      .catch(reject);
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

  return new Promise((resolve) => {

    const challenges = course.challenges;

    if (!currentChallengeId) { // no currentChallengeId means the test has not yet started
      return resolve(challenges[0]);
    }

    if (course.isAdaptive) {
      return resolve(_selectNextInAdaptiveMode(assessment, course));
    } else {
      return resolve(_selectNextInNormalMode(currentChallengeId, challenges));
    }
  });
}

function getScoredAssessment(assessmentId) {
  return new Promise((resolve, reject) => {

    let assessmentPix, answersPix, challengesPix, coursePix;

    assessmentRepository
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
        return courseRepository.get(assessmentPix.get('courseId'));
      })
      .then(course => {
        coursePix = course;
        const challengePromises = coursePix.challenges.map(challengeId => challengeRepository.get(challengeId));
        return Promise.all(challengePromises);
      })
      .then(challenges => {
        challengesPix = challenges;
        const competenceId = coursePix.competences[0];
        return skillRepository.getFromCompetence(competenceId);
      })
      .then(skillNames => {
        if (coursePix.isAdaptive) {
          const assessment = assessmentAdapter.getAdaptedAssessment(coursePix, answersPix, challengesPix, skillNames);

          assessmentPix.set('estimatedLevel', assessment.obtainedLevel);
          assessmentPix.set('pixScore', assessment.displayedPixScore);
        } else {
          assessmentPix.set('estimatedLevel', 0);
          assessmentPix.set('pixScore', 0);
        }
        resolve(assessmentPix);
      })
      .catch(reject);
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
