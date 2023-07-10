import { constants } from '../constants.js';

class Framework {
  constructor({ id, name, areas }) {
    this.id = id;
    this.name = name;
    this.areas = areas;
    this.isCore = this.name === constants.CORE_FRAMEWORK_NAME;
  }
}

export { Framework };
