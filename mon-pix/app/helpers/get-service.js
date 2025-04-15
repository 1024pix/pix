import { getOwner } from '@ember/application';
import Helper from '@ember/component/helper';

export default class GetService extends Helper {
  #owner;

  constructor() {
    super(...arguments);
    this.#owner = getOwner(this);
  }

  compute([service]) {
    return this.#owner.lookup(service);
  }
}
