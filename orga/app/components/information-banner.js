import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class InformationBanner extends Component {
  @service currentUser;
  @service router;

  get _isOnCertificationsPage() {
    return this.router.currentRouteName === 'authenticated.certifications';
  }

  get displayNewYearSchoolingRegistrationsImportBanner() {
    return !this.currentUser.prescriber.areNewYearSchoolingRegistrationsImported &&
      this.currentUser.isSCOManagingStudents &&
      !this.currentUser.isAgriculture &&
      !this._isOnCertificationsPage;
  }

  get displayNewYearCampaignsBanner() {
    return this.currentUser.isSCOManagingStudents && !this._isOnCertificationsPage;
  }

  get documentationLink() {
    return this.currentUser.isAgriculture ? 'https://view.genial.ly/6034cdf633f5220dc1eb101d' : 'https://view.genial.ly/5fda0b5aebe82c0d17f177ea';
  }
}
