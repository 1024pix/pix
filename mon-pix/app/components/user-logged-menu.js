import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';

export default class UserLoggedMenu extends Component {
  @service currentUser;

  @tracked canDisplayMenu = false;

  get displayedIdentifier() {
    return this.currentUser.user.email ? this.currentUser.user.email : this.currentUser.user.username;
  }

  get showMyTestsLink() {
    return this.currentUser.user.hasAssessmentParticipations;
  }

  @action
  toggleUserMenu() {
    this.canDisplayMenu = !this.canDisplayMenu;
  }

  @action
  closeMenu() {
    this.canDisplayMenu = false;
  }
}
