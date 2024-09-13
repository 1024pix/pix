import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class QcuProposal {
  constructor({ id, content, feedback }) {
    assertNotNullOrUndefined(id, 'The id is required for a QCU proposal.');
    assertNotNullOrUndefined(content, 'The content is required for a QCU proposal.');

    this.id = id;
    this.content = content;
    if (feedback) {
      this.feedback = feedback;
    }
  }
}

export { QcuProposal };
