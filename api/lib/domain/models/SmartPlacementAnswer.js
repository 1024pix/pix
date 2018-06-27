const ResultType = {
  OK: 'ok',
  KO: 'ko',
  SKIPPED: 'skipped',
  TIMEDOUT: 'timeout',
  PARTIALLY: 'partially',
  UNIMPLEMENTED: 'unimplemented',
};

/*
 * Traduction : réponse
 * Object existant dans le cadre d'un smart placement hors calcul de la réponse suivante
 */
class SmartPlacementAnswer {

  constructor({
    id,
    // attributes
    result,

    // relationship Ids
    challengeId,
  }) {
    this.id = id;
    this.result = result;
    this.challengeId = challengeId;
  }
}

SmartPlacementAnswer.ResultType = ResultType;

module.exports = SmartPlacementAnswer;
