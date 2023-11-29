export class FlashAssessmentAlgorithmRuleEngine {
  constructor(availableRules, configuration) {
    this._availableRules = availableRules;
    this._configuration = configuration;
  }

  execute({ assessmentAnswers, allChallenges }) {
    const applicableRules = this._getApplicableRules({
      answers: assessmentAnswers,
    });

    return applicableRules.reduce((availableChallenges, rule) => {
      return rule.execute({ assessmentAnswers, allChallenges, availableChallenges, ...this._configuration });
    }, allChallenges);
  }

  _getApplicableRules({ answers }) {
    return this._availableRules.filter((rule) =>
      rule.isApplicable({
        answers,
        ...this._configuration,
      }),
    );
  }
}
