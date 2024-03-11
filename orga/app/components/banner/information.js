import { service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pix-orga/config/environment';

export default class InformationBanner extends Component {
  @service currentUser;
  @service router;
  @service dayjs;

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
    return 'https://view.genial.ly/62cd67b161c1e3001759e818?idSlide=e11f61b2-3047-4be3-9a4d-dd9e7cc698ba';
  }

  get displayCertificationBanner() {
    const timeToDisplay = ENV.APP.CERTIFICATION_BANNER_DISPLAY_DATES.split(' ');
    const actualMonth = this.dayjs.self().format('MM');
    return this.currentUser.isSCOManagingStudents && timeToDisplay.includes(actualMonth);
  }

  get certificationDocumentationLink() {
    return 'https://view.genial.ly/62cd67b161c1e3001759e818?idSlide=0f1b3413-7fef-4c97-b890-675c5bafbe93';
  }
}
