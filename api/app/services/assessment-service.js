'use strict';

const courseRepository = require('../repositories/course-repository');

function selectNextChallengeId(course, currentChallengeId, assessment) {

  return new Promise((resolve) => {

    const challenges = course.challenges;

    if (!currentChallengeId) {
      return resolve(challenges[0]);
    }

    if (currentChallengeId === challenges[challenges.length - 1]) {
      return resolve(null);
    }

    let i = 1;
    for (let challengeId of challenges) {
      if (currentChallengeId === challengeId) {
        break;
      }
      i++;
    }
    return resolve(challenges[i]);
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
