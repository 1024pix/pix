import _ from 'lodash';

import { Validator } from './Validator.js';
import { ValidatorQCM } from './ValidatorQCM.js';
import { ValidatorQCU } from './ValidatorQCU.js';
import { ValidatorQROC } from './ValidatorQROC.js';
import { ValidatorQROCMDep } from './ValidatorQROCMDep.js';
import { ValidatorQROCMInd } from './ValidatorQROCMInd.js';

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
   * @param skill
   * @param validator
   * @param competenceId
   * @param format
   * @param locales
   * @param autoReply
   * @param focused
   * @param discriminant
   * @param difficulty
   * @param responsive
   * @param successProbabilityThreshold
   * @param shuffled
   * @param alternativeVersion
   */
  constructor({
    id,
    attachments,
    embedHeight,
    embedTitle,
    embedUrl,
    embedFragment,
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
    skill,
    validator,
    competenceId,
    focused,
    discriminant,
    difficulty,
    successProbabilityThreshold,
    responsive,
    shuffled,
    alternativeVersion,
  } = {}) {
    this.id = id;
    this.answer = answer;
    this.attachments = attachments;
    this.embedHeight = embedHeight;
    this.embedTitle = embedTitle;
    this.embedUrl = embedUrl;
    this.embedFragment = embedFragment;
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
    this.skill = skill;
    this.validator = validator;
    this.competenceId = competenceId;
    this.focused = focused;
    this.discriminant = discriminant;
    this.difficulty = difficulty;
    this.responsive = responsive;
    this.successProbabilityThreshold = successProbabilityThreshold;
    this.shuffled = shuffled;
    this.alternativeVersion = alternativeVersion;
  }

  isTimed() {
    return Number.isFinite(parseFloat(this.timer));
  }

  hasIllustration() {
    return Boolean(this.illustrationUrl);
  }

  hasEmbed() {
    return Boolean(this.embedUrl);
  }

  hasAtLeastOneAttachment() {
    return Array.isArray(this.attachments) && this.attachments.length > 0;
  }

  isFocused() {
    return this.focused;
  }

  get isMobileCompliant() {
    return this._isCompliant('Smartphone');
  }

  get isTabletCompliant() {
    return this._isCompliant('Tablet');
  }

  set successProbabilityThreshold(successProbabilityThreshold) {
    if (this.difficulty == null || this.discriminant == null || successProbabilityThreshold == null) return;
    this.minimumCapability = this.difficulty - Math.log(1 / successProbabilityThreshold - 1) / this.discriminant;
  }

  _isCompliant(type) {
    return this.responsive?.includes(type);
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
    return _.filter(challenges, (challenge) => challenge.skill?.id === skill.id);
  }

  hasEmbedFragment() {
    if (!this.embedUrl) {
      return false;
    }

    return this.embedUrl.endsWith('fragment.html');
  }
}

Challenge.Type = ChallengeType;

export { Challenge, ChallengeType as Type };
