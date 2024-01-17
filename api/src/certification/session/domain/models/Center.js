import { CenterTypes } from './CenterTypes.js';

class Center {
  constructor({ id, type } = {}) {
    this.id = id;
    this.type = CenterTypes[type];
  }

  get hasBillingMode() {
    return this.type !== CenterTypes.SCO;
  }
}

export { Center };
