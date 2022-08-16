import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class InformationBanner extends Component {
  @service currentUser;
  @service router;

  get _isOnCertificationsPage() {
    return this.router.currentRouteName === 'authenticated.certifications';
  }

  get displayNewYearOrganizationLearnersImportBanner() {
    return (
      !this.currentUser.prescriber.areNewYearOrganizationLearnersImported &&
      this.currentUser.isSCOManagingStudents &&
      !this._isOnCertificationsPage
    );
  }

  get importDocumentationLink() {
    return 'https://view.genial.ly/62cd67b161c1e3001759e818?idSlide=cd748a12-ef8e-4683-8139-eb851bd0eb23';
  }

  get displayNewYearCampaignsBanner() {
    return this.currentUser.organization.isSco && !this._isOnCertificationsPage;
  }

  get campaignDocumentationLink() {
    if (this.currentUser.isSCOManagingStudents) {
      return 'https://view.genial.ly/62cd67b161c1e3001759e818?idSlide=e11f61b2-3047-4be3-9a4d-dd9e7cc698ba';
    }
    return 'https://view.genial.ly/5fea2c3d6157fe0d69196ed9?idSlide=16cedb0c-3c1c-4cd3-a00b-49c01b0afcc2';
  }
}
