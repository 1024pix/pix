import { Element } from './Element.ts';

class Separator extends Element {
  constructor({ id }) {
    super({ id, type: 'separator' });
  }
}

export { Separator };
