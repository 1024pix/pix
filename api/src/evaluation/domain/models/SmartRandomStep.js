import { Skill } from '../../../shared/domain/models/index.js';

export const STEPS_NAMES = {
  DEFAULT_LEVEL: 'DEFAULT_LEVEL',
  EASY_TUBES: 'EASY_TUBES',
  MAX_REWARDING_SKILLS: 'MAX_REWARDING_SKILLS',
  NO_CHALLENGE: 'NO_CHALLENGE',
  RANDOM_PICK: 'RANDOM_PICK',
  TIMED_SKILLS: 'TIMED_SKILLS',
  TOO_DIFFICULT: 'TOO_DIFFICULT',
  ALREADY_TESTED: 'ALREADY_TESTED',
};

export class SmartRandomStep {
  /**
   * @type {string}
   */
  name;

  /**
   * @type {Skill[]}
   */
  outputSkills;

  /**
   * @param {string} name
   * @param {Skill[]} outputSkills
   */
  constructor(name, outputSkills) {
    this.name = name;
    // This ensures that the returned skills are “pure” and that any added properties are removed
    this.outputSkills = outputSkills.map((outputSkill) => new Skill(outputSkill));
  }
}
