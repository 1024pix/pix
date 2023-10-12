export class FlashAssessmentAlgorithmRuleEngine {
  constructor(availableRules, configuration) {
    this._availableRules = availableRules;
    this._configuration = configuration;
  }

  execute({ allAnswers, challenges }) {
    const applicableRules = this._getApplicableRules();

    return applicableRules.reduce((challenges, rule) => {
      return rule.execute({ allAnswers, challenges });
    }, challenges);
  }

  _getApplicableRules() {
    return this._availableRules.filter((rule) => rule.isApplicable(this._configuration));
  }
}
