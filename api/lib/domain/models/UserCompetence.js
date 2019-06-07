const _ = require('lodash');
const Promise = require('bluebird');

const Assessment = require('./Assessment');
const Course = require('./Course');
const Challenge = require('./Challenge');
const KnowledgeElement = require('./KnowledgeElement');
const Skill = require('./Skill');
const Scorecard = require('./Scorecard');

const { MAX_CHALLENGES_PER_SKILL_FOR_CERTIFICATION } = require('../constants');

class UserCompetence {

  constructor({
    id,
    // attributes
    index,
    name,
    // includes
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.index = index;
    this.name = name;
    // includes
    this.skills = [];
    this.challenges = [];
    // references
  }

  addSkill(newSkill) {
    const hasAlreadySkill = _(this.skills).filter((skill) => skill.name === newSkill.name).size();

    if (!hasAlreadySkill) {
      this.skills.push(newSkill);
    }
  }

  addCertificationChallenges({ certifiyingChallenges, certifiyingChallengesCorrectlyAnswered }) {
    this.addSkillsForChallenges(certifiyingChallengesCorrectlyAnswered);
    this.orderSkillsByDifficultyDesc();
    this.addCertifiyingChallenges(certifiyingChallenges, certifiyingChallengesCorrectlyAnswered);
    this.clearSkills();
    this.addSkillsOfSelectedChallenges();
  }

  clearSkills() {
    this.skills = [];
  }

  addChallenge(newChallenge) {
    const hasAlreadyChallenge = _(this.challenges).filter((challenge) => challenge.id === newChallenge.id).size();

    if (!hasAlreadyChallenge) {
      this.challenges.push(newChallenge);
    }
  }

  addSkillsForChallenges(certifiyingChallengesCorrectlyAnswered) {
    const challengesForCompetence = _.filter(certifiyingChallengesCorrectlyAnswered, (challenge) => challenge.competenceId === this.id);
    _.each(challengesForCompetence, (challenge) => {
      const publishedSkills = Challenge.getPublishedSkills(challenge.skills, certifiyingChallengesCorrectlyAnswered);
      _.each(publishedSkills, (skill) => this.addSkill(skill));
    });
  }

  orderSkillsByDifficultyDesc() {
    this.skills = Skill.sortByDifficultyDesc(this.skills);
  }

  addSkillsOfSelectedChallenges() {
    _.each(this.challenges, (challenge) => {
      _.each(challenge.skills, (skill) => this.addSkill(skill));
    });
  }

  addCertifiyingChallenges(certifiyingChallenges, certifiyingChallengesCorrectlyAnswered) {
    _.each(this.skills, (skill) => {
      if (this.hasEnoughChallenges()) {
        return;
      }
      const challengesToValidateCurrentSkill = Challenge.findBySkill(certifiyingChallenges, skill);
      const challengesToValidateCurrentSkillNeverAnsweredBefore = _.differenceBy(challengesToValidateCurrentSkill, certifiyingChallengesCorrectlyAnswered, 'id');
      const challenge = _.first(challengesToValidateCurrentSkillNeverAnsweredBefore) || _.first(challengesToValidateCurrentSkill);
      this.addChallenge(challenge);
    });
  }

  hasEnoughChallenges() {
    return _.size(this.challenges) === MAX_CHALLENGES_PER_SKILL_FOR_CERTIFICATION;
  }

  static async getWithCorrectlyAnsweredChallengesIdsV1({ competencesFetcher, coursesFetcher, lastAssessmentsFetcher, correctAnswersFetcher }) {
    return Promise.props({
      userCompetences: await _getUserCompetencesV1({ competencesFetcher, coursesFetcher, lastAssessmentsFetcher }),
      correctlyAnsweredChallengeIds: await _getCorrectlyAnsweredChallengesIdsV1({ lastAssessmentsFetcher, correctAnswersFetcher }),
    });
  }

  static async getWithCorrectlyAnsweredChallengesIdsV2({ competencesFetcher, knowledgeElementsByCompetenceFetcher, challengeIdsFetcher }) {
    return Promise.props({
      userCompetences: await _getUserCompetencesV2({ knowledgeElementsByCompetenceFetcher, competencesFetcher }),
      correctlyAnsweredChallengeIds: await _getCorrectlyAnsweredChallengesIdsV2({ knowledgeElementsByCompetenceFetcher, challengeIdsFetcher }),
    });
  }

  static getCertificationInputDatas(challengesFetcher) {
    return async ({ userCompetences, correctlyAnsweredChallengeIds }) => {
      const certifiyingChallenges = await _getCertifyingChallenges(userCompetences, challengesFetcher);
      const challengesCorrectlyAnswered = Challenge.findByIds(certifiyingChallenges, correctlyAnsweredChallengeIds);
      const certifiyingChallengesCorrectlyAnswered = _.intersectionBy(certifiyingChallenges, challengesCorrectlyAnswered, 'id');

      return { userCompetences, certifiyingChallenges, certifiyingChallengesCorrectlyAnswered };
    };
  }

  static updateWithChallenges({ userCompetences, certifiyingChallenges, certifiyingChallengesCorrectlyAnswered }) {
    return _.each(userCompetences, (userCompetence) =>
      userCompetence.addCertificationChallenges({ certifiyingChallenges, certifiyingChallengesCorrectlyAnswered })
    );
  }

}

function _findByCompetenceId(userCompetences, competenceId) {
  return userCompetences.find((userCompetence) => userCompetence.id === competenceId);
}

async function _getCertifyingChallenges(userCompetences, challengeFetcher) {
  const challenges = await challengeFetcher();
  return _.filter(challenges, _isChallengeCertifying(userCompetences));
}

function _isChallengeCertifying(userCompetences) {
  return (challenge) => challenge.isPublished() && _stillRecognizesChallenge(userCompetences, challenge);
}

function _stillRecognizesChallenge(userCompetences, challenge) {
  return _findByCompetenceId(userCompetences, challenge.competenceId);
}

async function _getUserCompetencesV1({ competencesFetcher, coursesFetcher, lastAssessmentsFetcher }) {
  const [allCompetences, allAdaptiveCourses, userLastAssessments] = await Promise.all([
    competencesFetcher(),
    coursesFetcher(),
    lastAssessmentsFetcher(),
  ]);
  return _buildForCertificationV1({ allCompetences, allAdaptiveCourses, userLastAssessments });
}

async function _getUserCompetencesV2({ competencesFetcher, knowledgeElementsByCompetenceFetcher }) {
  const [allCompetences, knowledgeElementsByCompetence] = await Promise.all([
    competencesFetcher(),
    knowledgeElementsByCompetenceFetcher(),
  ]);
  return _buildForCertificationV2({ knowledgeElementsByCompetence, allCompetences });
}

function _buildForCertificationV1({ allCompetences, allAdaptiveCourses, userLastAssessments }) {
  return allCompetences.map((competence) => {
    const userCompetence = new UserCompetence(competence);

    const course = Course.findByCompetenceId(allAdaptiveCourses, competence.id);
    const assessment = Assessment.findByCourseId(userLastAssessments, course.id);

    userCompetence.pixScore = assessment && assessment.getPixScore() || 0;
    userCompetence.estimatedLevel = assessment && assessment.getLevel() || 0;
    return userCompetence;
  });
}

function _buildForCertificationV2({ knowledgeElementsByCompetence, allCompetences }) {
  return allCompetences.map((competence) => {
    const userCompetence = new UserCompetence(competence);
    userCompetence.pixScore = Scorecard.getTotalEarnedPix(knowledgeElementsByCompetence[competence.id]);
    userCompetence.estimatedLevel = Scorecard.getCompetenceLevel(userCompetence.pixScore);
    return userCompetence;
  });
}

async function _getCorrectlyAnsweredChallengesIdsV1({ lastAssessmentsFetcher, correctAnswersFetcher }) {
  const userLastAssessments = await lastAssessmentsFetcher();
  return await Assessment.findCorrectlyAnsweredChallengeIds(userLastAssessments, correctAnswersFetcher);
}

async function _getCorrectlyAnsweredChallengesIdsV2({ knowledgeElementsByCompetenceFetcher, challengeIdsFetcher }) {
  const knowledgeElementsByCompetence = await knowledgeElementsByCompetenceFetcher();
  const directlyValidatedKnowledgeElement = KnowledgeElement.findDirectlyValidated({ knowledgeElementsByCompetence });
  const answerIds = _.map(directlyValidatedKnowledgeElement, 'answerId');

  return challengeIdsFetcher(answerIds);
}

module.exports = UserCompetence;
