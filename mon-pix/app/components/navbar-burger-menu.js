import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';

export default class NavbarBurgerMenu extends Component {
  @service currentUser;

  get showDashboard() {
    return ENV.APP.FT_DASHBOARD;
  }

  get showMyTestsLink() {
    return this.showDashboard && this.currentUser.user.hasAssessmentParticipations;
  }
}
