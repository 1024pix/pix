import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class HomeController extends Controller {
  @tracked id = null;
  @service router;
  @action
  onChange(event) {
    this.id = event.target.value;
  }
}
