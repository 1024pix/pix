import Component from '@glimmer/component';
import { action } from '@ember/object';
import { certificationIssueReportSubcategories, subcategoryToLabel } from 'pix-certif/models/certification-issue-report';

export default class InChallengeCertificationIssueReportFields extends Component {
  get reportLength() {
    return this.args.inChallengeCategory.description
      ? this.args.inChallengeCategory.description.length
      : 0;
  }

  get isOtherSubcategorySelected() {
    return this.args.inChallengeCategory.subcategory === certificationIssueReportSubcategories.OTHER;
  }

  @action
  onChangeSubcategory(event) {
    this.args.inChallengeCategory.subcategory = event.target.value;
    this.args.inChallengeCategory.description = null;
  }

  options = ['IMAGE_NOT_DISPLAYING', 'LINK_NOT_WORKING', 'EMBED_NOT_WORKING',
    'FILE_NOT_OPENING', 'WEBSITE_UNAVAILABLE', 'WEBSITE_BLOCKED', 'OTHER'].map((subcategoryKey) => {
    const subcategory = certificationIssueReportSubcategories[subcategoryKey];
    return {
      value: certificationIssueReportSubcategories[subcategory],
      label: subcategoryToLabel[subcategory],
    };
  })
}
