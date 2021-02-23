import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class NavbarBurgerMenu extends Component {
  @service currentUser;

  get showMyTestsLink() {
    return this.currentUser.user.hasAssessmentParticipations;
  }
}
