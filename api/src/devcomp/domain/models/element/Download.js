import { Element } from './Element.js';

class Download extends Element {
  constructor({ id, files }) {
    super({ id, type: 'download' });

    this.files = files;
  }
}

export { Download };
