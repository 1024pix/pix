import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class QcuCorrectionResponse {
  constructor({ globalResult, feedback, solutionId }) {
    assertNotNullOrUndefined(globalResult, 'Le résultat global est obligatoire pour une réponse de QCU');
    assertNotNullOrUndefined(feedback, 'Le feedback est obligatoire pour une réponse de QCU');
    assertNotNullOrUndefined(solutionId, "L'id de la proposition correcte est obligatoire pour une réponse de QCU");

    this.globalResult = globalResult;
    this.feedback = feedback;
    this.solutionId = solutionId;
  }
}

export { QcuCorrectionResponse };
