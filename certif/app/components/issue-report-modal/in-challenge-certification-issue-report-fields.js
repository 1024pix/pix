import Component from '@glimmer/component';
import { action } from '@ember/object';
import { certificationIssueReportSubcategories, subcategoryToLabel, subcategoryToCode } from 'pix-certif/models/certification-issue-report';

export default class InChallengeCertificationIssueReportFields extends Component {

  @action
  onChangeSubcategory(event) {
    this.args.inChallengeCategory.subcategory = event.target.value;
    this.args.inChallengeCategory.description = null;
  }

  options = ['IMAGE_NOT_DISPLAYING', 'EMBED_NOT_WORKING', 'FILE_NOT_OPENING',
    'WEBSITE_UNAVAILABLE', 'WEBSITE_BLOCKED'].map((subcategoryKey) => {
    const subcategory = certificationIssueReportSubcategories[subcategoryKey];
    return {
      value: certificationIssueReportSubcategories[subcategory],
      label: `${subcategoryToCode[subcategory]} ${subcategoryToLabel[subcategory]}`,
    };
  })
}
