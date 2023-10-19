import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  certificationIssueReportSubcategories,
  subcategoryToCode,
  subcategoryToLabel,
  inChallengeIssueReportSubCategories,
} from 'pix-certif/models/certification-issue-report';
import { service } from '@ember/service';

export default class InChallengeCertificationIssueReportFields extends Component {
  @service intl;

  @action
  onChangeSubcategory(option) {
    this.args.inChallengeCategory.subcategory = option;
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
