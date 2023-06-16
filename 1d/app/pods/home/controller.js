import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class HomeController extends Controller {
  @tracked id = null;
  @action
  onChange(event) {
    this.id = event.target.value;
  }
}
