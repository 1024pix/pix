import { Element } from './Element.js';

class Embed extends Element {
  constructor({ id, isCompletionRequired, title, url, instruction, height, solution }) {
    super({ id, type: 'embed' });

    this.isCompletionRequired = isCompletionRequired;
    this.title = title;
    this.url = url;
    this.instruction = instruction;
    this.height = height;
    this.isAnswerable = this.isCompletionRequired;
    this.solution = solution;
  }
}

export { Embed };
