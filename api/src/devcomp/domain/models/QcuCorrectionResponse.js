import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class QcuCorrectionResponse {
  constructor({ status, feedback, solution }) {
    assertNotNullOrUndefined(status, 'The result is required for a QCU response');
    assertNotNullOrUndefined(feedback, 'The feedback is required for a QCU response');
    assertNotNullOrUndefined(solution, 'The id of the correct proposal is required for a QCU response');

    this.status = status;
    this.feedback = feedback;
    this.solution = solution;
  }
}

export { QcuCorrectionResponse };
