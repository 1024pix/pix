import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LoginOrRegisterToAccessRoute extends Controller {

  queryParams = ['displayRegisterForm'];

  @tracked displayRegisterForm = true;

  @action
  toggleFormsVisibility() {
    this.displayRegisterForm = !this.displayRegisterForm;
  }

}
