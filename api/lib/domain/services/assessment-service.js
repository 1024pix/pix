const courseRepository = require('../../infrastructure/repositories/course-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const challengeService = require('../../domain/services/challenge-service');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');

const assessmentUtils = require('./assessment-service-utils');
const _ = require('../../infrastructure/utils/lodash-utils');

const { NotFoundError, NotElligibleToScoringError } = require('../../domain/errors');

const scoringService = require('../../domain/services/scoring-service');

function _selectNextInAdaptiveMode(assessment) {

  return new Promise((resolve, reject) => {
    answerRepository.findByAssessment(assessment.get('id'))
      .then(answers => {
        const responsePattern = assessmentUtils.getResponsePattern(answers);
        return assessmentUtils.getNextChallengeFromScenarios(assessment.get('courseId'), responsePattern);
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

function _getAssessmentResultDetails(answers, knowledgeData) {

  const performanceStats = scoringService.getPerformanceStats(answers, knowledgeData);
  const diagnosis = scoringService.computeDiagnosis(performanceStats, knowledgeData);

  return {
    'estimatedLevel': diagnosis.estimatedLevel,
    'pixScore': diagnosis.pixScore,
    'notAcquiredKnowledgeTags': performanceStats.notAcquiredKnowledgeTags,
    'acquiredKnowledgeTags': performanceStats.acquiredKnowledgeTags
  };
}

function selectNextChallengeId(course, currentChallengeId, assessment) {

  return new Promise((resolve) => {

    const challenges = course.challenges;

    if (!currentChallengeId) { // no currentChallengeId means the test has not yet started
      return resolve(challenges[0]);
    }

    if (course.isAdaptive) {
      return resolve(_selectNextInAdaptiveMode(assessment));
    } else {
      return resolve(_selectNextInNormalMode(currentChallengeId, challenges));
    }
  });
}

function getScoredAssessment(assessmentId) {
  return new Promise((resolve, reject) => {

    let assessment;
    let answers;

    assessmentRepository
      .get(assessmentId)
      .then(retrievedAssessment => {

        if (retrievedAssessment === null) {
          return Promise.reject(new NotFoundError(`Unable to find assessment with ID ${assessmentId}`));
        } else if (_.startsWith(retrievedAssessment.get('courseId'), 'null')) {
          return Promise.reject(new NotElligibleToScoringError(`Assessment with ID ${assessmentId} is a preview Challenge`));
        }

        assessment = retrievedAssessment;

        return answerRepository.findByAssessment(assessment.get('id'));
      })
      .then(retrievedAnswers => {
        answers = retrievedAnswers;
        return courseRepository.get(assessment.get('courseId'));
      })
      .then(course => {
        const challengePromises = course.challenges.map(challengeId => challengeRepository.get(challengeId));
        return Promise.all(challengePromises);
      })
      .then(challenges => {

        const knowledgeData = challengeService.getKnowledgeData(challenges);

        const resultDetails = _getAssessmentResultDetails(answers, knowledgeData);

        assessment.set('estimatedLevel', resultDetails.estimatedLevel);
        assessment.set('pixScore', resultDetails.pixScore);

        resolve(assessment);
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
      .then((course) => resolve(selectNextChallengeId(course, currentChallengeId, assessment)))
      .catch((error) => reject(error));
  });
}

module.exports = {

  getAssessmentNextChallengeId,
  getScoredAssessment,

  _getAssessmentResultDetails

};
