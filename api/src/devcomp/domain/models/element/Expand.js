import { Element } from './Element.js';

class Expand extends Element {
  /**
   *
   * @param{string} id
   * @param{string} title
   * @param{string} content
   */
  constructor({ id, title, content } = {}) {
    super({ id, type: 'expand' });
    this.title = title;
    this.content = content;
  }
}

export { Expand };
