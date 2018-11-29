const _ = require('lodash');
const Skill = require('./Skill');
const Validator = require('./Validator');
const ValidatorQCM = require('./ValidatorQCM');
const ValidatorQCU = require('./ValidatorQCU');
const ValidatorQROC = require('./ValidatorQROC');
const ValidatorQROCMDep = require('./ValidatorQROCMDep');
const ValidatorQROCMInd = require('./ValidatorQROCMInd');

const ChallengeType = Object.freeze({
  QCU: 'QCU',
  QCM: 'QCM',
  QROC: 'QROC',
  QROCM_IND: 'QROCM-ind',
  QROCM_DEP: 'QROCM-dep',
});

/**
 * Traduction: Épreuve
 */
class Challenge {

  /**
   * Constructeur d'épreuve
   *
   * @param id
   * @param attachments
   * @param embedHeight
   * @param embedTitle
   * @param embedUrl
   * @param illustrationUrl
   * @param instruction
   * @param proposals
   * @param status
   * @param timer
   * @param type
   * @param answer ==> Il semblerait que answer ne serve plus.
   * @param skills
   * @param validator
   * @param competenceId
   */
  constructor(
    {
      id,
      // attributes
      attachments,
      embedHeight,
      embedTitle,
      embedUrl,
      illustrationUrl,
      instruction,
      proposals,
      status,
      timer,
      type,
      // includes
      answer,
      skills = [],
      validator,
      // references
      competenceId,
    } = {}) {
    this.id = id;
    // attributes
    this.answer = answer;
    this.attachments = attachments;
    this.embedHeight = embedHeight;
    this.embedTitle = embedTitle;
    this.embedUrl = embedUrl;
    this.illustrationUrl = illustrationUrl;
    this.instruction = instruction;
    this.proposals = proposals;
    this.timer = timer;
    this.status = status;
    this.type = type;
    // includes
    this.skills = skills;
    this.validator = validator;
    // references
    this.competenceId = competenceId;
  }

  /**
   * @deprecated
   */
  static fromAttributes(attributes) {
    const challenge = new Challenge();
    Object.assign(challenge, attributes);
    if (!challenge.skills) {
      challenge.skills = [];
    }
    return challenge;
  }

  addSkill(skill) {
    this.skills.push(skill);
  }

  hasSkill(searchedSkill) {
    return this.skills.filter((skill) => skill.name === searchedSkill.name).length > 0;
  }

  // Same than isActive for algo
  isPublished() {
    return ['validé', 'validé sans test', 'pré-validé'].includes(this.status);
  }

  get hardestSkill() {
    return this.skills.reduce((s1, s2) => (s1.difficulty > s2.difficulty) ? s1 : s2);
  }

  testsAtLeastOneNewSkill(alreadyAssessedSkills) {
    return _(this.skills).differenceWith(alreadyAssessedSkills, Skill.areEqual).size() > 0;
  }

  hasAllSkilledAlreadyCovered(knowledgeElements, targetProfile) {
    const skillIdsAlreadyCovered = _.map(knowledgeElements, 'skillId');
    const skillOfChallengePresentInTargetProfile = _.filter(this.skills, (challengeSkill) =>
    {
      return targetProfile.skills.find((profileSkill) => profileSkill.id === challengeSkill.id);
    });
    return _.every(skillOfChallengePresentInTargetProfile, (skill) => _.includes(skillIdsAlreadyCovered, skill.id));
  }

  static createValidatorForChallengeType({ challengeType, solution }) {
    switch (challengeType) {
      case ChallengeType.QCU:
        return new ValidatorQCU({ solution });

      case ChallengeType.QCM:
        return new ValidatorQCM({ solution });

      case ChallengeType.QROC:
        return new ValidatorQROC({ solution });

      case ChallengeType.QROCM_IND:
        return new ValidatorQROCMInd({ solution });

      case ChallengeType.QROCM_DEP:
        return new ValidatorQROCMDep({ solution });

      default:
        return new Validator({ solution });
    }
  }
}

Challenge.Type = ChallengeType;

module.exports = Challenge;
