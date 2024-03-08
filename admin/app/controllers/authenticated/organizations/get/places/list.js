import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class List extends Controller {
  @action
  refresh() {
    this.send('refreshModel');
  }
}
