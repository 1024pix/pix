import { Element } from './Element.js';

class CustomDraft extends Element {
  constructor({ id, title, url, instruction, height }) {
    super({ id, type: 'custom-draft' });

    this.title = title;
    this.url = url;
    this.instruction = instruction;
    this.height = height;
  }
}

export { CustomDraft };
