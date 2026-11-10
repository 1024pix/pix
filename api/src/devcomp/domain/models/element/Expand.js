import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { Element } from './Element.ts';

class Expand extends Element {
  /**
   *
   * @param{string} id
   * @param{string} title
   * @param{string} content
   */
  constructor({ id, title, content } = {}) {
    super({ id, type: 'expand' });
    assertNotNullOrUndefined(title, 'The title is required for an Expand element');
    assertNotNullOrUndefined(content, 'The content is required for an Expand element');
    this.title = title;
    this.content = content;
  }
}

export { Expand };
