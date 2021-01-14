import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class InformationBanner extends Component {
  @service currentUser;
  get displayNewYearSchoolingRegistrationsImportBanner() {
    return !this.currentUser.prescriber.areNewYearSchoolingRegistrationsImported &&
      this.currentUser.isSCOManagingStudents &&
      !this.currentUser.isAgriculture;
  }

  get displayNewYearCampaignsBanner() {
    return this.currentUser.isSCOManagingStudents &&
      !this.currentUser.isAgriculture;
  }
}
