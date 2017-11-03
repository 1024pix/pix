const _ = require('lodash');

const { UserNotFoundError } = require('../errors');
const UserCompetence = require('../../../lib/domain/models/UserCompetence');
const Skill = require('../../../lib/domain/models/Skill');

const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const competenceRepository = require('../../../lib/infrastructure/repositories/competence-repository');

function _loadAnwsersByAssessments(assessments) {
  const answersPromises = [];
  assessments.forEach((assessment) => {
    answersPromises.push(answerRepository.findByAssessment(assessment.id));
  });

  return Promise.all(answersPromises);
}

function _getCompetenceById(competences, competenceId) {
  return _(competences).find((competence) => competence.id === competenceId);
}

function _castCompetencesToUserCompetences([challenges, competences, answersByAssessments]) {

  competences = _(competences).reduce((result, value) => {
    result.push(new UserCompetence(value));
    return result;
  }, []);

  return [challenges, competences, answersByAssessments];
}

function _loadRequiredChallengesInformationsAndAnswers(answersByAssessments) {
  return Promise.all([
    challengeRepository.list(), competenceRepository.list(), answersByAssessments
  ]);
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

  getSkillProfile(userId) {

    return assessmentRepository
      .findCompletedAssessmentsByUserId(userId)
      .then(_loadAnwsersByAssessments)
      .then(_loadRequiredChallengesInformationsAndAnswers)
      .then(_castCompetencesToUserCompetences)
      .then(([challenges, competences, answersByAssessments]) => {

        const answers = _.flatten(answersByAssessments).filter((answer) => answer.get('result') === 'ok');

        _(answers).forEach((answer) => {
          const challenge = _(challenges).find((challenge) => challenge.id === answer.get('challengeId'));

          if(challenge) {
            const competence = _getCompetenceById(competences, challenge.competence);

            _(challenge.knowledgeTags).forEach((skill) => {
              if(competence) {
                competence.addSkill(new Skill(skill));
              }
            });
          }
        });

        return competences;
      });
  }
};
