const courseRepository = require('../../infrastructure/repositories/course-repository');
const Answer = require('../../domain/models/data/answer');
const Scenario = require('../../domain/models/data/scenario');
const _ = require('../../infrastructure/utils/lodash-utils');

function _selectNextInAdaptiveMode(assessment) {

  return new Promise((resolve, reject) => {

    const answerIds = assessment.related('answers').pluck('id');

    Answer.where('id', 'IN', answerIds).fetchAll().then((answers) => {
      const responsePattern = answers.map(answer => (answer.attributes.result == 'ok') ? 'ok' : 'ko').join('-');

      Scenario.where('path', responsePattern).orderBy('updatedAt', 'DESC').fetch().then((scenario) => {
        if (!scenario) {
          return resolve(null);
        } else if(scenario.attributes.nextChallengeId == 'null') {
          resolve(null);
        } else {
          resolve(scenario.attributes.nextChallengeId);
        }
      });
    }).catch((error) => reject(error));
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


module.exports = {

  getAssessmentNextChallengeId(assessment, currentChallengeId) {

    return new Promise((resolve, reject) => {

      const courseId = assessment.get('courseId');
      courseRepository
      .get(courseId)
      .then((course) => resolve(selectNextChallengeId(course, currentChallengeId, assessment)))
      .catch((error) => reject(error));
    });
  }

};
