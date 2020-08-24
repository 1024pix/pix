import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class InformationBanner extends Component {
  @service currentUser;

  get informationBannerMustBeDisplayed() {
    return !this.currentUser.prescriber.areNewYearStudentsImported &&
      this.currentUser.isSCOManagingStudents;
  }
}
