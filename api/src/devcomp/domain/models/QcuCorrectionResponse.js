import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class QcuCorrectionResponse {
  constructor({ status, feedback, solution }) {
    assertNotNullOrUndefined(status, 'Le résultat est obligatoire pour une réponse de QCU');
    assertNotNullOrUndefined(feedback, 'Le feedback est obligatoire pour une réponse de QCU');
    assertNotNullOrUndefined(solution, "L'id de la proposition correcte est obligatoire pour une réponse de QCU");

    this.status = status;
    this.feedback = feedback;
    this.solution = solution;
  }
}

export { QcuCorrectionResponse };
