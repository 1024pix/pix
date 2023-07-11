import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class NavbarBurgerMenu extends Component {
  @service currentUser;

  get fullName() {
    return `${this.currentUser.prescriber.firstName} ${this.currentUser.prescriber.lastName}`;
  }
}
