import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class QrocmCorrectionResponse {
  constructor({ status, feedback, solutionValue }) {
    assertNotNullOrUndefined(status, 'Le résultat est obligatoire pour une réponse de QROCM');
    assertNotNullOrUndefined(feedback, 'Le feedback est obligatoire pour une réponse de QROCM');
    assertNotNullOrUndefined(solutionValue, 'La solution est obligatoire pour une réponse de QROCM');

    this.status = status;
    this.feedback = feedback;
    this.solutionValue = solutionValue;
  }
}

export { QrocmCorrectionResponse };
