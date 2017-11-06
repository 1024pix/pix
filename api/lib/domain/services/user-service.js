const { take, sortBy } = require('lodash');

const { UserNotFoundError } = require('../errors');
const UserCompetence = require('../../../lib/domain/models/UserCompetence');
const Skill = require('../../../lib/domain/models/Skill');

const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const competenceRepository = require('../../../lib/infrastructure/repositories/competence-repository');

function _getRightAnswersByAssesments(assessments) {

  const answersByAssessmentsPromises = assessments.map((assessment) => answerRepository.getRightAnswersByAssessment(assessment.id));

  return Promise.all(answersByAssessmentsPromises)
    .then(answersByAssessments => {
      return answersByAssessments.reduce((accu, answersByAssessment) => {
        answersByAssessment.models.forEach(answer => {
          accu.push(answer.toJSON());
        });
        return accu;
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
  const skillsWithExtractedLevel = skills.map((skill) => {
    return {
      name: skill,
      difficulty: parseInt(skill.name.slice(-1))
    };
  });

  const sortedSkills = sortBy(skillsWithExtractedLevel, ['difficulty'])
    .reverse()
    .map((skill) => skill.name);

  return take(sortedSkills, 3);
}

function _sortAndExtractThreeMostDifficultsCompetencesSkills(competences) {
  competences.forEach((competence) => {
    competence.skills = _sortThreeMostDifficultSkillsInDesc(competence.skills);
  });
  return competences;
}

function _getRelatedChallengeById(challenges, answer) {
  return challenges.find((challenge) => challenge.id === answer.challengeId);
}

function _addSkillsToCompetence(competence, challenge) {
  if (challenge) {
    challenge.knowledgeTags.forEach((skill) => {
      if (competence) {
        competence.addSkill(new Skill(skill));
      }
    });
  }
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
      .then(_getRightAnswersByAssesments)
      .then(_loadRequiredChallengesInformationsAndAnswers)
      .then(_castCompetencesToUserCompetences)
      .then(([challenges, competences, answers]) => {
        answers.map((answer) => {
          const challenge = _getRelatedChallengeById(challenges, answer);
          const competence = _getCompetenceByChallengeCompetenceId(competences, challenge);
          _addSkillsToCompetence(competence, challenge);
        });
        return competences;
      })
      .then(_sortAndExtractThreeMostDifficultsCompetencesSkills);
  }
};
