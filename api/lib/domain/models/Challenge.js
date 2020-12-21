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
   * @param format
   * @param locales
   * @param autoReply
   */
  constructor(
    {
      id,
      attachments,
      embedHeight,
      embedTitle,
      embedUrl,
      format,
      illustrationAlt,
      alternativeInstruction,
      illustrationUrl,
      instruction,
      proposals,
      status,
      timer,
      type,
      locales,
      autoReply,
      answer,
      skills = [],
      validator,
      competenceId,
    } = {}) {
    this.id = id;
    this.answer = answer;
    this.attachments = attachments;
    this.embedHeight = embedHeight;
    this.embedTitle = embedTitle;
    this.embedUrl = embedUrl;
    this.format = format;
    this.illustrationAlt = illustrationAlt;
    this.illustrationUrl = illustrationUrl;
    this.instruction = instruction;
    this.proposals = proposals;
    this.timer = timer;
    this.status = status;
    this.type = type;
    this.locales = locales;
    this.autoReply = autoReply;
    this.alternativeInstruction = alternativeInstruction;
    this.skills = skills;
    this.validator = validator;
    this.competenceId = competenceId;
  }

  addSkill(skill) {
    this.skills.push(skill);
  }

  isTimed() {
    return Number.isFinite(parseFloat(this.timer));
  }

  hasSkill(searchedSkill) {
    return this.skills.some((skill) => skill.id === searchedSkill.id);
  }

  get hardestSkill() {
    return this.skills.reduce((s1, s2) => (s1.difficulty > s2.difficulty) ? s1 : s2);
  }

  testsAtLeastOneNewSkill(alreadyAssessedSkills) {
    return _(this.skills).differenceWith(alreadyAssessedSkills, Skill.areEqual).size() > 0;
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

  static findBySkill({ challenges, skill }) {
    return _.filter(challenges, (challenge) => challenge.hasSkill(skill));
  }
}

Challenge.Type = ChallengeType;

module.exports = Challenge;
