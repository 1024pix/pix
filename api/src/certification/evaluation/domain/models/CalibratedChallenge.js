/**
 * @typedef {import('./CalibratedChallengeSkill.js').CalibratedChallengeSkill} CalibratedChallengeSkill
 */

export const Accessibility = Object.freeze({
  RAS: 'RAS',
  OK: 'OK',
});

export class CalibratedChallenge {
  /**
   * Constructeur d'épreuve calibrée
   *
   * @param id
   * @param {number} discriminant
   * @param {number} difficulty
   * @param {Accessibility} blindnessCompatibility
   * @param {Accessibility} colorBlindnessCompatibility
   * @param {CalibratedChallengeSkill} skill
   */
  constructor({
    id,
    discriminant,
    difficulty,
    blindnessCompatibility,
    colorBlindnessCompatibility,
    skill,
    successProbabilityThreshold,
  }) {
    this.id = id;
    this.discriminant = discriminant;
    this.difficulty = difficulty;
    this.blindnessCompatibility = blindnessCompatibility;
    this.colorBlindnessCompatibility = colorBlindnessCompatibility;
    this.skill = skill;
    this.successProbabilityThreshold = successProbabilityThreshold;
  }

  get isAccessible() {
    return (
      (this.blindnessCompatibility === Accessibility.OK || this.blindnessCompatibility === Accessibility.RAS) &&
      (this.colorBlindnessCompatibility === Accessibility.OK || this.colorBlindnessCompatibility === Accessibility.RAS)
    );
  }

  set successProbabilityThreshold(successProbabilityThreshold) {
    if (this.difficulty == null || this.discriminant == null || successProbabilityThreshold == null) return;
    this.minimumCapability = this.difficulty - Math.log(1 / successProbabilityThreshold - 1) / this.discriminant;
  }
}
