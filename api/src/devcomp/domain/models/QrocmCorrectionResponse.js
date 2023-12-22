import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class QrocmCorrectionResponse {
  constructor({ status, feedback, solution }) {
    assertNotNullOrUndefined(status, 'Le résultat est obligatoire pour une réponse de QROCM');
    assertNotNullOrUndefined(feedback, 'Le feedback est obligatoire pour une réponse de QROCM');
    assertNotNullOrUndefined(solution, 'La solution est obligatoire pour une réponse de QROCM');

    this.status = status;
    this.feedback = feedback;
    this.solution = solution;
  }
}

export { QrocmCorrectionResponse };
