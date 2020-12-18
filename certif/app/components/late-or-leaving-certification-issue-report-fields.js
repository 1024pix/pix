import Component from '@glimmer/component';
import { action } from '@ember/object';
import { certificationIssueReportSubcategories } from 'pix-certif/models/certification-issue-report';

export default class OtherCertificationissueReportFields extends Component {
  get reportLength() {
    return this.args.lateOrLeavingCategory.description
      ? this.args.lateOrLeavingCategory.description.length
      : 0;
  }

  @action
  onChangeSubcategory(event) {
    this.args.lateOrLeavingCategory.subcategory = event.target.value;
  }

  options = [
    { value: certificationIssueReportSubcategories.LEFT_EXAM_ROOM, label: 'A quitté la salle d\'examen, sans l\'accord du surveillant' },
    { value: certificationIssueReportSubcategories.SIGNATURE_ISSUE, label: 'Etait présent(e) mais a oublié de signer, ou a signé sur la mauvaise ligne' },
  ];
}
