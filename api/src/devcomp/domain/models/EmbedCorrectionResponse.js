import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class EmbedCorrectionResponse {
  constructor({ status, solution }) {
    assertNotNullOrUndefined(status, 'The result is required for a embed response');
    assertNotNullOrUndefined(solution, 'The id of the correct proposal is required for a embed response');

    this.status = status;
    this.feedback = '';
    this.solution = solution;
  }
}

export { EmbedCorrectionResponse };
