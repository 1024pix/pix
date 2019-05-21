const _ = require('lodash');

const { UserNotFoundError } = require('../errors');
const UserCompetence = require('../../../lib/domain/models/UserCompetence');

const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const competenceRepository = require('../../../lib/infrastructure/repositories/competence-repository');
const courseRepository = require('../../../lib/infrastructure/repositories/course-repository');

function _findCorrectAnswersByAssessments(assessments) {

  const answersByAssessmentsPromises = assessments.map((assessment) => answerRepository.findCorrectAnswersByAssessment(assessment.id));

  return Promise.all(answersByAssessmentsPromises)
    .then((answersByAssessments) => {
      return answersByAssessments.reduce((answersInJSON, answersByAssessment) => {
        answersByAssessment.forEach((answer) => {
          answersInJSON.push(answer);
        });
        return answersInJSON;
      }, []);
    });
}

function _getCompetenceByChallengeCompetenceId(competences, challenge) {
  return challenge ? competences.find((competence) => competence.id === challenge.competenceId) : null;
}

function _castCompetencesToUserCompetences(competences) {
  return competences.map((value) => new UserCompetence(value));
}

function _findChallengeBySkill(challenges, skill) {
  return _(challenges).filter((challenge) => {
    return challenge.hasSkill(skill) && challenge.isPublished();
  }).value();
}

function _skillHasAtLeastOneChallengeInTheReferentiel(skill, challenges) {
  const challengesBySkill = _findChallengeBySkill(challenges, skill);
  return challengesBySkill.length > 0;
}

function _addPixScoreAndEstimatedLevelToCompetences(userCompetences, { allAdaptativeCourses, userLastAssessments }) {
  userCompetences.forEach((userCompetence) => {
    const currentCourse = allAdaptativeCourses.find((course) => course.competences[0] === userCompetence.id);
    const assessment = userLastAssessments.find((assessment) => currentCourse.id === assessment.courseId);
    if (assessment) {
      userCompetence.pixScore = assessment.getPixScore();
      userCompetence.estimatedLevel = assessment.getLevel();
    } else {
      userCompetence.pixScore = 0;
      userCompetence.estimatedLevel = 0;
    }
  });
}

function _sortByDifficultyDesc(skills) {
  return _(skills)
    .sortBy('difficulty')
    .reverse()
    .value();
}

function _orderSkillsOfCompetenceByDifficulty(competences) {
  competences.forEach((competence) => {
    competence.skills = _sortByDifficultyDesc(competence.skills);
  });
  return competences;
}

function _getChallengeById(challenges, id) {
  return _(challenges).find({ id });
}

function _filterAssessmentWithEstimatedLevelGreaterThanZero(assessments) {
  return _(assessments).filter((assessment) => assessment.getLastAssessmentResult().level >= 1).values();
}

function _addChallengesToUserCompetences({ allChallenges, userCompetences, challengeIdsCorrectlyAnswered }) {

  challengeIdsCorrectlyAnswered.forEach((challengeId) => {
    const challenge = _getChallengeById(allChallenges, challengeId);
    const competence = _getCompetenceByChallengeCompetenceId(userCompetences, challenge);

    if (challenge && competence) {
      challenge.skills
        .filter((skill) => _skillHasAtLeastOneChallengeInTheReferentiel(skill, allChallenges))
        .forEach((publishedSkill) => competence.addSkill(publishedSkill));
    }
  });

  userCompetences = _orderSkillsOfCompetenceByDifficulty(userCompetences);
  const challengesAlreadyAnswered = challengeIdsCorrectlyAnswered.map((challengeId) => _getChallengeById(allChallenges, challengeId));

  userCompetences.forEach((userCompetence) => {
    const testedSkills = [];
    userCompetence.skills.forEach((skill) => {
      if (userCompetence.challenges.length < 3) {
        const challengesToValidateCurrentSkill = _findChallengeBySkill(allChallenges, skill);
        const challengesLeftToAnswer = _.difference(challengesToValidateCurrentSkill, challengesAlreadyAnswered);

        const challenge = (_.isEmpty(challengesLeftToAnswer)) ? _.first(challengesToValidateCurrentSkill) : _.first(challengesLeftToAnswer);

        //TODO : Mettre le skill en entier (Skill{id, name})
        challenge.testedSkill = skill.name;
        testedSkills.push(skill);

        userCompetence.addChallenge(challenge);
      }
    });
    userCompetence.skills = testedSkills;
  });

  return userCompetences;
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

  async getProfileToCertify(userId, limitDate) {
    const [allAdaptativeCourses, allChallenges, allCompetences] = await Promise.all([
      courseRepository.getAdaptiveCourses(),
      challengeRepository.list(),
      competenceRepository.list()
    ]);
    const userLastAssessments = await assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser(userId, limitDate);
    const filteredAssessments = _filterAssessmentWithEstimatedLevelGreaterThanZero(userLastAssessments);
    const correctAnswers = await _findCorrectAnswersByAssessments(filteredAssessments);
    const userCompetences = _castCompetencesToUserCompetences(allCompetences);
    _addPixScoreAndEstimatedLevelToCompetences(userCompetences, { allAdaptativeCourses, userLastAssessments });

    const challengeIdsCorrectlyAnswered = _.map(correctAnswers, 'challengeId');
    return _addChallengesToUserCompetences({
      allChallenges,
      userCompetences,
      challengeIdsCorrectlyAnswered
    });
  },
};
