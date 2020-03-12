import { action } from '@ember/object';
import Component from '@ember/component';

export default class LoginOrRegister extends Component {

  displayRegisterForm = true;

  @action
  toggleFormsVisibility() {
    this.toggleProperty('displayRegisterForm');
  }
}
