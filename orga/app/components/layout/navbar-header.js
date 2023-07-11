import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';

export default class NavbarHeader extends Component {
  @tracked isMenuOpen = false;

  @action
  openMenu() {
    this.isMenuOpen = true;
  }

  @action
  closeMenu() {
    this.isMenuOpen = false;
  }
}
