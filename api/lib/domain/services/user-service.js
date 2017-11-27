const _ = require('lodash');

const { UserNotFoundError } = require('../errors');
const UserCompetence = require('../../../lib/domain/models/UserCompetence');

const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const competenceRepository = require('../../../lib/infrastructure/repositories/competence-repository');

function _findCorrectAnswersByAssessments(assessments) {

  const answersByAssessmentsPromises = assessments.map((assessment) => answerRepository.findCorrectAnswersByAssessment(assessment.id));

  return Promise.all(answersByAssessmentsPromises)
    .then(answersByAssessments => {
      return answersByAssessments.reduce((answersInJSON, answersByAssessment) => {
        answersByAssessment.models.forEach(answer => {
          answersInJSON.push(answer);
        });
        return answersInJSON;
      }, []);
    });
}

function _getCompetenceByChallengeCompetenceId(competences, challenge) {
  return challenge ? competences.find((competence) => competence.id === challenge.competence) : null;
}

function _loadRequiredChallengesInformationsAndAnswers(answers) {
  return Promise.all([
    challengeRepository.list(), competenceRepository.list(), answers
  ]);
}

function _castCompetencesToUserCompetences([challenges, competences, answers]) {
  competences = competences.reduce((result, value) => {
    result.push(new UserCompetence(value));
    return result;
  }, []);

  return [challenges, competences, answers];
}

function _sortThreeMostDifficultSkillsInDesc(skills) {
  return _(skills)
    .sortBy('difficulty')
    .reverse()
    .take(3)
    .value();
}

function _limitSkillsToTheThreeHighestOrderedByDifficultyDesc(competences) {
  competences.forEach((competence) => {
    competence.skills = _sortThreeMostDifficultSkillsInDesc(competence.skills);
  });
  return competences;
}

function _getRelatedChallengeById(challenges, answer) {
  return challenges.find((challenge) => challenge.id === answer.get('challengeId'));
}

function _getChallengeById(challenges, challengeId) {
  return _(challenges).find((challenge) => challenge.id === challengeId);
}

function _findChallengeBySkill(challenges, skill) {
  return _(challenges).filter((challenge) => {
    return challenge.hasSkill(skill) && challenge.isPublished();
  }).value();
}

function _filterAssessmentWithEstimatedLevelGreaterThanZero(assessments) {
  return _(assessments).filter(assessment => assessment.get('estimatedLevel') >= 1).values();
}

module.exports = {
  isUserExistingByEmail(email) {
    return userRepository
      .findByEmail(email)
      .then(() => true)
      .catch(() => {
        throw new UserNotFoundError();
      });
  },

  isUserExistingById(id) {
    return userRepository
      .findUserById(id)
      .then(() => true)
      .catch(() => {
        throw new UserNotFoundError();
      });
  },

  getCertificationProfile(userId) {

    return assessmentRepository
      .findLastCompletedAssessmentsForEachCoursesByUser(userId)
      .then(_filterAssessmentWithEstimatedLevelGreaterThanZero)
      .then(_findCorrectAnswersByAssessments)
      .then(_loadRequiredChallengesInformationsAndAnswers)
      .then(_castCompetencesToUserCompetences)
      .then(([challenges, userCompetences, answers]) => {
        answers.forEach((answer) => {
          const challenge = _getRelatedChallengeById(challenges, answer);
          const competence = _getCompetenceByChallengeCompetenceId(userCompetences, challenge);

          if (challenge && competence) {
            challenge.skills.forEach((skill) => {
              competence.addSkill(skill);
            });
          }
        });

        userCompetences = _limitSkillsToTheThreeHighestOrderedByDifficultyDesc(userCompetences);

        const challengeIdsAlreadyAnswered = answers.map(answer => answer.get('challengeId'));
        const challengesAlreadyAnswered = challengeIdsAlreadyAnswered.map(challengeId => _getChallengeById(challenges, challengeId));

        userCompetences.forEach((userCompetence) => {
          userCompetence.skills.forEach((skill) => {
            const challengesToValidateCurrentSkill = _findChallengeBySkill(challenges, skill);
            const challengesLeftToAnswer = _.difference(challengesToValidateCurrentSkill, challengesAlreadyAnswered);

            const challenge = (_.isEmpty(challengesLeftToAnswer)) ? _.first(challengesToValidateCurrentSkill) : _.first(challengesLeftToAnswer);

            challenge.testedSkill = skill.name;

            userCompetence.addChallenge(challenge);
          });
        });

        return userCompetences;
      });
  }
};
