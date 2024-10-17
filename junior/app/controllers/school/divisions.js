import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class Divisions extends Controller {
  @action
  refreshModel() {
    this.send('refreshSchool');
  }
}
