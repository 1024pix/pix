import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class BlockText {
  constructor({ content }) {
    assertNotNullOrUndefined(content, 'The content is required for a text block');
    this.content = content;
    this.type = 'text';
  }
}

export { BlockText };
