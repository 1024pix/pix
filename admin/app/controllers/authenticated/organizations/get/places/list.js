import { action } from '@ember/object';

import Controller from '@ember/controller';

export default class List extends Controller {
  @action
  refresh() {
    this.send('refreshModel');
  }
}
