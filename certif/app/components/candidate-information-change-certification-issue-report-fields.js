import Component from '@glimmer/component';
import { action } from '@ember/object';

import { certificationIssueReportSubcategories } from 'pix-certif/models/certification-issue-report';

export default class CandidateInformationChangeCertificationIssueReportFieldsComponent extends Component {
  get reportLength() {
    return this.args.candidateInformationChangeCategory.description
      ? this.args.candidateInformationChangeCategory.description.length
      : 0;
  }

  @action
  onChangeSubcategory(event) {
    this.args.candidateInformationChangeCategory.subcategory = event.target.value;
  }

  options = [
    { value: certificationIssueReportSubcategories.NAME_OR_BIRTHDATE, label: 'Prénom/Nom/Date de naissance' },
    { value: certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE, label: 'Temps majoré' },
  ];
}
