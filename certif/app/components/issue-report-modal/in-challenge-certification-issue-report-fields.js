import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import {
  certificationIssueReportSubcategories,
  inChallengeIssueReportSubCategories,
  subcategoryToCode,
  subcategoryToLabel,
} from 'pix-certif/models/certification-issue-report';

export default class InChallengeCertificationIssueReportFields extends Component {
  @service intl;

  @action
  onChangeSubcategory(option) {
    this.args.inChallengeCategory.subcategory = option;
  }

  @action
  onChangeQuestionNumber(event) {
    this.args.changeQuestionNumber(event.target.value);
  }

  get categoryCode() {
    return this.args.inChallengeCategory.categoryCode;
  }

  options = inChallengeIssueReportSubCategories
    .map((subcategoryKey) => {
      const subcategory = certificationIssueReportSubcategories[subcategoryKey];
      const labelForSubcategory = subcategoryToLabel[subcategory];
      return {
        value: certificationIssueReportSubcategories[subcategory],
        label: `${subcategoryToCode[subcategory]} ${this.intl.t(labelForSubcategory)}`,
      };
    })
    .filter(Boolean);
}
