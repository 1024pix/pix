import { action } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
export default class LoginOrRegister extends Component {
  displayRegisterForm = true;

  @action
  toggleFormsVisibility() {
    this.toggleProperty('displayRegisterForm');
  }
}
