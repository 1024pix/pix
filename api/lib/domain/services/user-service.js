const _ = require('lodash');

const {
  MINIMUM_COMPETENCE_LEVEL_FOR_CERTIFIABILITY,
} = require('../constants');

const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const UserCompetence = require('../../../lib/domain/models/UserCompetence');
const Challenge = require('../models/Challenge');
const Scorecard = require('../models/Scorecard');
const CertificationProfile = require('../models/CertificationProfile');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const competenceRepository = require('../../../lib/infrastructure/repositories/competence-repository');
const knowledgeElementRepository = require('../../../lib/infrastructure/repositories/knowledge-element-repository');
const courseRepository = require('../../../lib/infrastructure/repositories/course-repository');

async function getCertificationProfile({ userId, limitDate, isV2Certification = true }) {
  const certificationProfile = new CertificationProfile({
    userId,
    profileDate: limitDate,
  });
  if (isV2Certification) {
    await _fillCertificationProfileWithUserCompetencesAndCorrectlyAnsweredChallengeIdsV2(certificationProfile);
  }
  else {
    await _fillCertificationProfileWithUserCompetencesAndCorrectlyAnsweredChallengeIdsV1(certificationProfile);
  }
  return _fillCertificationProfileWithCertificationChallenges(certificationProfile);
}

async function _fillCertificationProfileWithCertificationChallenges(certificationProfile) {
  const allChallenges = await challengeRepository.list();
  const challengesAlreadyAnswered = certificationProfile.challengeIdsCorrectlyAnswered.map((challengeId) => Challenge.findById(allChallenges, challengeId));

  challengesAlreadyAnswered.forEach((challenge) => {
    if (!challenge) {
      return;
    }

    const userCompetence = _getUserCompetenceByChallengeCompetenceId(certificationProfile.userCompetences, challenge);

    if (!userCompetence || !_isCompetenceCertifiable(userCompetence)) {
      return;
    }

    challenge.skills
      .filter((skill) => _skillHasAtLeastOneChallengeInTheReferentiel(skill, allChallenges))
      .forEach((publishedSkill) => userCompetence.addSkill(publishedSkill));
  });

  certificationProfile.userCompetences = UserCompetence.orderSkillsOfCompetenceByDifficulty(certificationProfile.userCompetences);

  certificationProfile.userCompetences.forEach((userCompetence) => {
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

  return certificationProfile;
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
  return userCompetence.estimatedLevel >= MINIMUM_COMPETENCE_LEVEL_FOR_CERTIFIABILITY;
}

async function _fillCertificationProfileWithUserCompetencesAndCorrectlyAnsweredChallengeIdsV1(certificationProfile) {
  const [allCompetences, allAdaptativeCourses] = await Promise.all([
    competenceRepository.list(),
    courseRepository.getAdaptiveCourses()
  ]);
  const userLastAssessments = await assessmentRepository
    .findLastCompletedAssessmentsForEachCoursesByUser(certificationProfile.userId, certificationProfile.profileDate);
  certificationProfile.userCompetences = _createUserCompetencesV1({ allCompetences, allAdaptativeCourses, userLastAssessments });
  const correctAnswers = await _findCorrectAnswersByAssessments(userLastAssessments);
  certificationProfile.challengeIdsCorrectlyAnswered = _.map(correctAnswers, 'challengeId');

  return certificationProfile;
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

async function _fillCertificationProfileWithUserCompetencesAndCorrectlyAnsweredChallengeIdsV2(certificationProfile) {
  const allCompetences = await competenceRepository.list();

  const knowledgeElementsByCompetence = await knowledgeElementRepository
    .findUniqByUserIdGroupedByCompetenceId({ userId: certificationProfile.userId, limitDate: certificationProfile.profileDate });
  certificationProfile.userCompetences = _createUserCompetencesV2({ userId: certificationProfile.userId, knowledgeElementsByCompetence, allCompetences });

  const knowledgeElements = KnowledgeElement.findDirectlyValidatedFromGroups(knowledgeElementsByCompetence);
  const answerIds = _.map(knowledgeElements, 'answerId');

  certificationProfile.challengeIdsCorrectlyAnswered = await answerRepository.findChallengeIdsFromAnswerIds(answerIds);

  return certificationProfile;
}

module.exports = {
  getCertificationProfile,
};
