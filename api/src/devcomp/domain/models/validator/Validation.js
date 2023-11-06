/**
 * Traduction: Élément de correction portant sur la conformité d'une réponse
 * Context:    Objet existant dans le cadre de la correction d'une réponse pendant le fonctionnement
 *             interne de l'algorithme.
 */
class Validation {
  constructor({ result, resultDetails } = {}) {
    this.result = result;
    this.resultDetails = resultDetails;
  }
}

export { Validation };
