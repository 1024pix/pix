const STEPS_NAMES = {
  NO_CHALLENGES: 'NO_CHALLENGES',
  EASY_TUBES: 'EASY_TUBES',
  TIMED_SKILLS: 'TIMED_SKILLS',
  DEFAULT_LEVEL: 'DEFAULT_LEVEL',
  TOO_DIFFICULT: 'TOO_DIFFICULT',
  RANDOM_PICK: 'RANDOM_PICK',
};

class SmartRandomStep {
  name;
  /**
   * @param {string} name
   * @param {[Skill]} outputSkills
   */
  constructor(name, outputSkills) {
    this.name = name;
    this.outputSkills =
      name === STEPS_NAMES.RANDOM_PICK ? outputSkills : outputSkills.map((skill) => Object.getPrototypeOf(skill));
  }
}

export { SmartRandomStep, STEPS_NAMES };
