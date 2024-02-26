import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class BlockSelectOption {
  constructor({ id, content }) {
    assertNotNullOrUndefined(id, 'The id is required for a select block option');
    assertNotNullOrUndefined(content, 'The content is required for a select block option');

    this.id = id;
    this.content = content;
  }
}

export { BlockSelectOption };
