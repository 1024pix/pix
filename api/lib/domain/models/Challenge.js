const _ = require('lodash');
const Skill = require('./Skill');
const Validator = require('./Validator');
const ValidatorQCM = require('./ValidatorQCM');
const ValidatorQCU = require('./ValidatorQCU');
const ValidatorQROC = require('./ValidatorQROC');
const ValidatorQROCMDep = require('./ValidatorQROCMDep');
const ValidatorQROCMInd = require('./ValidatorQROCMInd');

/**
 * Traduction: Épreuve
 */
class Challenge {

  constructor({
    id,
    // attributes
    answer,
    attachments,
    competence,
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
    validator,
    // references
    skills = [],
  } = {}) {
    this.id = id;
    // attributes
    this.answer = answer;
    this.attachments = attachments;
    this.competence = competence;
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
    this.validator = validator;
    // references
    this.skills = skills;
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

  static createValidatorForChallengeType({ challengeType, solution }) {
    switch (challengeType) {
      case 'QCU':
        return new ValidatorQCU({ solution });

      case 'QCM':
        return new ValidatorQCM({ solution });

      case 'QROC':
        return new ValidatorQROC({ solution });

      case 'QROCM-ind':
        return new ValidatorQROCMInd({ solution });

      case 'QROCM-dep':
        return new ValidatorQROCMDep({ solution });

      default:
        return new Validator({ solution });
    }
  }

}

module.exports = Challenge;
