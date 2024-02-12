import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class QcmProposal {
  constructor({ id, content }) {
    assertNotNullOrUndefined(id, 'The id is required for a QCM proposal');
    assertNotNullOrUndefined(content, 'The content is required for a QCM proposal');

    this.id = id;
    this.content = content;
  }
}

export { QcmProposal };
