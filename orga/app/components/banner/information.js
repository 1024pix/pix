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

  get campaignMiddleSchoolDocumentationLink() {
    if (this.currentUser.isSCOManagingStudents && this.currentUser.isAgriculture) {
      return 'https://view.genial.ly/5f687a0451337070914e54f9?idSlide=cf788556-ff93-4aba-a5c2-312c450c7553';
    } else if (this.currentUser.isSCOManagingStudents) {
      return 'https://view.genial.ly/5f295b80302a810d2ff9fa60/?idSlide=e11f61b2-3047-4be3-9a4d-dd9e7cc698ba';
    }
    return 'https://kutt.it/prefe';
  }

  get campaignHighSchoolDocumentationLink() {
    if (this.currentUser.isSCOManagingStudents && this.currentUser.isAgriculture) {
      return 'https://view.genial.ly/5f687a0451337070914e54f9?idSlide=cf788556-ff93-4aba-a5c2-312c450c7553';
    } else if (this.currentUser.isSCOManagingStudents) {
      return 'https://view.genial.ly/5f46390591252c0d5246bb63/?idSlide=e11f61b2-3047-4be3-9a4d-dd9e7cc698ba';
    }
    return 'https://kutt.it/prefe';
  }
}
