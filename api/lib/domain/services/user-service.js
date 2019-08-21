const _ = require('lodash');

const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const UserCompetence = require('../../../lib/domain/models/UserCompetence');
const Challenge = require('../models/Challenge');
const Scorecard = require('../models/Scorecard');
const Skill = require('../models/Skill');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const competenceRepository = require('../../../lib/infrastructure/repositories/competence-repository');
const knowledgeElementRepository = require('../../../lib/infrastructure/repositories/knowledge-element-repository');
const courseRepository = require('../../../lib/infrastructure/repositories/course-repository');

async function getProfileToCertifyV1({ userId, limitDate }) {
  const { userCompetences, challengeIdsCorrectlyAnswered } = await _getUserCompetencesAndAnswersV1({
    userId,
    limitDate
  });

  return _pickChallengesForUserCompetences({
    userCompetences,
    challengeIdsCorrectlyAnswered,
  });
}

async function getProfileToCertifyV2({ userId, limitDate }) {
  const { userCompetences, challengeIdsCorrectlyAnswered } = await _getUserCompetencesAndAnswersV2({
    userId,
    limitDate
  });

  return _pickChallengesForUserCompetences({
    userCompetences,
    challengeIdsCorrectlyAnswered,
  });
}

async function _findCorrectAnswersByAssessments(assessments) {
  const answersByAssessmentsPromises = assessments.map((assessment) =>
    answerRepository.findCorrectAnswersByAssessmentId(assessment.id));

  const answersByAssessments = await Promise.all(answersByAssessmentsPromises);

  return _.flatten(answersByAssessments);
}

function _getUserCompetenceByChallengeCompetenceId(userCompetences, challenge) {
  return challenge ? userCompetences.find((userCompetence) => userCompetence.id === challenge.competenceId) : null;
}

function _skillHasAtLeastOneChallengeInTheReferentiel(skill, challenges) {
  const challengesBySkill = Challenge.findPublishedBySkill(challenges, skill);
  return challengesBySkill.length > 0;
}

function _createUserCompetencesV1({ allCompetences, allAdaptativeCourses, userLastAssessments }) {
  return allCompetences.map((competence) => {
    const userCompetence = new UserCompetence(competence);
    const currentCourse = allAdaptativeCourses.find((course) => course.competences[0] === userCompetence.id);
    const assessment = userLastAssessments.find((assessment) => currentCourse.id === assessment.courseId);
    userCompetence.pixScore = assessment && assessment.getPixScore() || 0;
    userCompetence.estimatedLevel = assessment && assessment.getLevel() || 0;
    return userCompetence;
  });
}

function _isCompetenceCertifiable(userCompetence) {
  return userCompetence.estimatedLevel >= 1;
}

async function _pickChallengesForUserCompetences({ userCompetences, challengeIdsCorrectlyAnswered }) {
  const allChallenges = await challengeRepository.list();
  const challengesAlreadyAnswered = challengeIdsCorrectlyAnswered.map((challengeId) => Challenge.findById(allChallenges, challengeId));

  challengesAlreadyAnswered.forEach((challenge) => {
    if (!challenge) {
      return;
    }

    const userCompetence = _getUserCompetenceByChallengeCompetenceId(userCompetences, challenge);

    if (!userCompetence || !_isCompetenceCertifiable(userCompetence)) {
      return;
    }

    challenge.skills
      .filter((skill) => _skillHasAtLeastOneChallengeInTheReferentiel(skill, allChallenges))
      .forEach((publishedSkill) => userCompetence.addSkill(publishedSkill));
  });

  userCompetences = UserCompetence.orderSkillsOfCompetenceByDifficulty(userCompetences);

  userCompetences.forEach((userCompetence) => {
    const testedSkills = [];
    userCompetence.skills.forEach((skill) => {
      if (userCompetence.hasEnoughChallenges()) {
        const challengesToValidateCurrentSkill = Challenge.findPublishedBySkill(allChallenges, skill);
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
  const correctAnswers = await _findCorrectAnswersByAssessments(userLastAssessments);
  const challengeIdsCorrectlyAnswered = _.map(correctAnswers, 'challengeId');

  return { userCompetences, challengeIdsCorrectlyAnswered };
}

function _createUserCompetencesV2({ userId, knowledgeElementsByCompetence, allCompetences }) {
  return allCompetences.map((competence) => {
    const userCompetence = new UserCompetence(competence);

    const scorecard = Scorecard.buildFrom({
      userId,
      knowledgeElements: knowledgeElementsByCompetence[competence.id],
      competence
    });

    userCompetence.estimatedLevel = scorecard.level;
    userCompetence.pixScore = scorecard.earnedPix;

    return userCompetence;
  });
}

async function _getUserCompetencesAndCorrectlyAnsweredChallengeIdsV2({ userId, limitDate }) {
  const allCompetences = await competenceRepository.list();

  const knowledgeElementsByCompetence = await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({ userId, limitDate });
  const userCompetences = _createUserCompetencesV2({ userId, knowledgeElementsByCompetence, allCompetences });

  const knowledgeElements = KnowledgeElement.findDirectlyValidatedFromGroups(knowledgeElementsByCompetence);
  const answerIds = _.map(knowledgeElements, 'answerId');

  const challengeIdsCorrectlyAnswered = await answerRepository.findChallengeIdsFromAnswerIds(answerIds);

  return { userCompetences, challengeIdsCorrectlyAnswered };
}

module.exports = {
  getProfileToCertifyV1,
  getProfileToCertifyV2,
  _pickChallengesForUserCompetences,
  _getUserCompetencesAndAnswersV1,
  _getUserCompetencesAndAnswersV2,
};
