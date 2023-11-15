import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class QcuCorrectionResponse {
  constructor({ status, feedback, solutionId }) {
    assertNotNullOrUndefined(status, 'Le résultat est obligatoire pour une réponse de QCU');
    assertNotNullOrUndefined(feedback, 'Le feedback est obligatoire pour une réponse de QCU');
    assertNotNullOrUndefined(solutionId, "L'id de la proposition correcte est obligatoire pour une réponse de QCU");

    this.status = status;
    this.feedback = feedback;
    this.solutionId = solutionId;
  }
}

export { QcuCorrectionResponse };
