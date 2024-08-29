import { Element } from './Element.js';

class Separator extends Element {
  constructor({ id }) {
    super({ id, type: 'separator' });
  }
}

export { Separator };
