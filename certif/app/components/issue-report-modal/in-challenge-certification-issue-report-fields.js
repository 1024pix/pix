import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  certificationIssueReportSubcategories,
  subcategoryToCode,
  subcategoryToLabel,
} from 'pix-certif/models/certification-issue-report';

export default class InChallengeCertificationIssueReportFields extends Component {
  @action
  onChangeSubcategory(option) {
    this.args.inChallengeCategory.subcategory = option;
  }

  get categoryCode() {
    return this.args.inChallengeCategory.categoryCode;
  }

  options = [
    'IMAGE_NOT_DISPLAYING',
    'EMBED_NOT_WORKING',
    'FILE_NOT_OPENING',
    'WEBSITE_UNAVAILABLE',
    'WEBSITE_BLOCKED',
    'EXTRA_TIME_EXCEEDED',
    'SOFTWARE_NOT_WORKING',
    'UNINTENTIONAL_FOCUS_OUT',
    'SKIP_ON_OOPS',
    'ACCESSIBILITY_ISSUE',
  ]
    .map((subcategoryKey) => {
      const subcategory = certificationIssueReportSubcategories[subcategoryKey];
      const labelForSubcategory = subcategoryToLabel[subcategory];
      return {
        value: certificationIssueReportSubcategories[subcategory],
        label: `${subcategoryToCode[subcategory]} ${labelForSubcategory}`,
      };
    })
    .filter(Boolean);
}
