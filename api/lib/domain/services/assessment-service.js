const courseRepository = require('../../infrastructure/repositories/course-repository');
const Answer = require('../../domain/models/data/answer');
const _ = require('../../infrastructure/utils/lodash-utils');

function _selectNextInAdaptiveMode(assessment, challenges) {

  return new Promise((resolve) => {

    const answerIds = assessment.related('answers').pluck('id');

    // Check input
    // else if (answerIds.length > 1) { // if there is more than one answer, user reached the end of test
    if (answerIds.length > 1) { // if there is more than one answer, user reached the end of test
      resolve(null);
    }
    // ADAPTIVE TEST HAPPENS HERE
    else if (answerIds.length === 1) {
      Answer.where('id', _.first(answerIds)).fetch().then((firstAnswerToFirstChallenge) => {

        if (firstAnswerToFirstChallenge.attributes.result === 'ok') {
          resolve(_.second(challenges));
        } else {
          resolve(_.third(challenges));
        }
      });
    }


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
      return resolve(_selectNextInAdaptiveMode(assessment, challenges));
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
