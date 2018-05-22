const { AssessmentEndedError } = require('../errors');

const assessmentAdapter = require('../../infrastructure/adapters/assessment-adapter');
const _ = require('lodash');

module.exports = function({
  assessment,
  courseRepository,
  answerRepository,
  challengeRepository,
  skillRepository,
  competenceRepository
} = {}) {

  const courseId = assessment.courseId;
  let answers, challenges, competence, course;

  return courseRepository.get(courseId)
    .then(fetchedCourse => (course = fetchedCourse))
    .then(() => answerRepository.findByAssessment(assessment.id))
    .then(fetchedAnswers => (answers = fetchedAnswers))
    .then(() => competenceRepository.get(course.competences[0]))
    .then((fetchedCompetence) => (competence = fetchedCompetence))
    .then(() => challengeRepository.findByCompetence(competence))
    .then(fetchedChallenges => (challenges = fetchedChallenges))
    .then(() => skillRepository.findByCompetence(competence))
    .then(skills => getNextChallengeInAdaptiveCourse(answers, challenges, skills))
    .then((nextChallenge) => {
      if (nextChallenge) {
        return nextChallenge;
      }

      throw new AssessmentEndedError();
    })
    .then(challengeRepository.get);

};

function getNextChallengeInAdaptiveCourse(answersPix, challengesPix, skills) {
  const assessment = assessmentAdapter.getSmartAssessment(answersPix, challengesPix, skills);
  return _.get(assessment, 'nextChallenge.id', null);
}

