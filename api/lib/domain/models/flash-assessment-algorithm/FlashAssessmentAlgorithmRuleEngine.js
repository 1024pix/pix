export class FlashAssessmentAlgorithmRuleEngine {
  constructor(availableRules, configuration) {
    this._availableRules = availableRules;
    this._configuration = configuration;
  }

  execute({ allAnswers, allChallenges }) {
    const applicableRules = this._getApplicableRules();

    return applicableRules.reduce((availableChallenges, rule) => {
      return rule.execute({ allAnswers, allChallenges, availableChallenges });
    }, allChallenges);
  }

  _getApplicableRules() {
    return this._availableRules.filter((rule) => rule.isApplicable(this._configuration));
  }
}
