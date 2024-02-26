import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class TransitionText {
  constructor({ content, grainId }) {
    assertNotNullOrUndefined(content, 'The content is required for a transition text');
    assertNotNullOrUndefined(grainId, 'The grain id is required for a transition text');

    this.content = content;
    this.grainId = grainId;
  }
}

export { TransitionText };
