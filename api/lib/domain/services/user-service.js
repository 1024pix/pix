const _ = require('lodash');

const { UserNotFoundError } = require('../errors');
const UserCompetence = require('../../../lib/domain/models/UserCompetence');

const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const competenceRepository = require('../../../lib/infrastructure/repositories/competence-repository');
const courseRepository = require('../../../lib/infrastructure/repositories/course-repository');

async function _findCorrectAnswersByAssessments(assessments) {
  const answersByAssessmentsPromises = assessments.map((assessment) =>
    answerRepository.findCorrectAnswersByAssessment(assessment.id));

  const answersByAssessments = await Promise.all(answersByAssessmentsPromises);

  return _.flatten(answersByAssessments);
}

function _getUserCompetenceByChallengeCompetenceId(userCompetences, challenge) {
  return challenge ? userCompetences.find((userCompetence) => userCompetence.id === challenge.competenceId) : null;
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

function _createUserCompetencesV1({ allCompetences, allAdaptativeCourses, userLastAssessments }) {
  return allCompetences.map((competence) => {
    const userCompetence = new UserCompetence(competence);
    const currentCourse = allAdaptativeCourses.find((course) => course.competences[0] === userCompetence.id);
    const assessment = userLastAssessments.find((assessment) => currentCourse.id === assessment.courseId);
    if (assessment) {
      userCompetence.pixScore = assessment.getPixScore();
      userCompetence.estimatedLevel = assessment.getLevel();
    } else {
      userCompetence.pixScore = 0;
      userCompetence.estimatedLevel = 0;
    }
    return userCompetence;
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

async function _pickChallengesForUserCompetences({ userCompetences, challengeIdsCorrectlyAnswered }) {
  const allChallenges = await challengeRepository.list();
  const challengesAlreadyAnswered = challengeIdsCorrectlyAnswered.map((challengeId) => _getChallengeById(allChallenges, challengeId));

  challengesAlreadyAnswered.forEach((challenge) => {
    const userCompetence = _getUserCompetenceByChallengeCompetenceId(userCompetences, challenge);

    if (challenge && userCompetence) {
      challenge.skills
        .filter((skill) => _skillHasAtLeastOneChallengeInTheReferentiel(skill, allChallenges))
        .forEach((publishedSkill) => userCompetence.addSkill(publishedSkill));
    }
  });

  userCompetences = _orderSkillsOfCompetenceByDifficulty(userCompetences);

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

async function _getUserCompetencesAndAnswersV1({ userId, limitDate }) {
  const [allCompetences, allAdaptativeCourses] = await Promise.all([
    competenceRepository.list(),
    courseRepository.getAdaptiveCourses()
  ]);
  const userLastAssessments = await assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser(userId, limitDate);
  const userCompetences = _createUserCompetencesV1({ allCompetences, allAdaptativeCourses, userLastAssessments });
  const filteredAssessments = _filterAssessmentWithEstimatedLevelGreaterThanZero(userLastAssessments);
  const correctAnswers = await _findCorrectAnswersByAssessments(filteredAssessments);
  const challengeIdsCorrectlyAnswered = _.map(correctAnswers, 'challengeId');

  return { userCompetences, challengeIdsCorrectlyAnswered };
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

  async getProfileToCertifyV1(userId, limitDate) {
    const { userCompetences, challengeIdsCorrectlyAnswered } = await _getUserCompetencesAndAnswersV1({
      userId,
      limitDate
    });

    return _pickChallengesForUserCompetences({
      userCompetences,
      challengeIdsCorrectlyAnswered,
    });
  },
};
