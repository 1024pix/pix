const { AssessmentEndedError } = require('../errors');

const assessmentAdapter = require('../../infrastructure/adapters/assessment-adapter');
const _ = require('lodash');
const logger = require('../../infrastructure/logger');

module.exports = function getNextChallengeForPlacement({
  assessment,
  courseRepository,
  answerRepository,
  challengeRepository,
  skillRepository,
  competenceRepository
} = {}) {

  const courseId = assessment.courseId;
  let answers, challenges, competence, course;

  const logContext = {
    zone: 'usecase.getNextChallengeForPlacement',
    type: 'usecase',
    assessmentId: assessment.id,
    courseId,
  };
  logger.trace(logContext, 'looking for next challenge in PLACEMENT assessment');

  return courseRepository.get(courseId)
    .then((fetchedCourse) => (course = fetchedCourse))
    .then(() => answerRepository.findByAssessment(assessment.id))
    .then((fetchedAnswers) => (answers = fetchedAnswers))
    .then(() => competenceRepository.get(course.competences[0]))
    .then((fetchedCompetence) => (competence = fetchedCompetence))
    .then(() => challengeRepository.findByCompetenceId(competence.id))
    .then((fetchedChallenges) => (challenges = fetchedChallenges))
    .then(() => skillRepository.findByCompetenceId(competence.id))
    .then((skills) => {
      logContext.answers = answers.map((answer) => answer.id);
      logContext.challenges = challenges.map((challenge) => challenge.id);
      logContext.skills = skills.map((skill) => skill.name);
      logger.trace(logContext, 'fetched all entites. Running cat to look for next challenge');
      return getNextChallengeInAdaptiveCourse(assessment.id, answers, challenges, skills);
    })
    .then((nextChallenge) => {
      if (nextChallenge) {
        logContext.nextChallengeId = nextChallenge;
        logger.trace(logContext, 'found next challenge');
        return nextChallenge;
      }

      logger.trace(logContext, 'no found challenges');
      throw new AssessmentEndedError();
    })
    .then(challengeRepository.get);

};

function getNextChallengeInAdaptiveCourse(assessmentId, answersPix, challengesPix, skills) {
  const assessment = assessmentAdapter.getAdaptedAssessment(assessmentId, answersPix, challengesPix, skills);
  return _.get(assessment, 'nextChallenge.id', null);
}
