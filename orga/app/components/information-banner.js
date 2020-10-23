import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

const bannerDeadLine = '2020-11-02';
export default class InformationBanner extends Component {
  @service currentUser;
  get displayNewYearSchoolingRegistrationsImportBanner() {
    return !this.currentUser.prescriber.areNewYearSchoolingRegistrationsImported &&
      this.currentUser.isSCOManagingStudents &&
      !this.currentUser.isAgriculture;
  }

  get displayNewYearCampaignsBanner() {
    const isBeforeBannerDeadLine = new Date() < new Date(bannerDeadLine);
    return isBeforeBannerDeadLine && this.currentUser.isSCOManagingStudents;
  }
}
