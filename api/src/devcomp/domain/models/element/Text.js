import { Element } from './Element.js';

class Text extends Element {
  constructor({ id, content, tag }) {
    super({ id, type: 'text', tag: ' ' });

    this.content = content;
    this.tag = tag;
  }
}

export { Text };
