import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class InformationBanner extends Component {
  @service currentUser;
  @service router;

  get _isOnCertificationsPage() {
    return this.router.currentRouteName === 'authenticated.certifications';
  }

  get displayNewYearSchoolingRegistrationsImportBanner() {
    return !this.currentUser.prescriber.areNewYearSchoolingRegistrationsImported && this.currentUser.isSCOManagingStudents && !this._isOnCertificationsPage;
  }

  get importMiddleSchoolDocumentationLink() {
    return this.currentUser.isAgriculture ? 'https://view.genial.ly/5f687a0451337070914e54f9?idSlide=50100e2e-cbe3-41ff-b424-d965e5eeac7c' : 'https://view.genial.ly/5f295b80302a810d2ff9fa60/?idSlide=cd748a12-ef8e-4683-8139-eb851bd0eb23';
  }

  get importHighSchoolDocumentationLink() {
    return this.currentUser.isAgriculture ? 'https://view.genial.ly/5f687a0451337070914e54f9?idSlide=50100e2e-cbe3-41ff-b424-d965e5eeac7c' : 'https://view.genial.ly/5f46390591252c0d5246bb63/?idSlide=cd748a12-ef8e-4683-8139-eb851bd0eb23';
  }

  get displayNewYearCampaignsBanner() {
    return this.currentUser.isSCOManagingStudents && !this._isOnCertificationsPage;
  }

  get documentationLink() {
    return 'https://view.genial.ly/6077017b8b37870d98620200';
  }
}
