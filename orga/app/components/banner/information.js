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
    return 'https://view.genial.ly/6077017b8b37870d98620200';
  }
}
