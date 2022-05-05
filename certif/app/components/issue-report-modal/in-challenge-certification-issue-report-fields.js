import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import {
  certificationIssueReportSubcategories,
  subcategoryToLabel,
  subcategoryToCode,
} from 'pix-certif/models/certification-issue-report';

export default class InChallengeCertificationIssueReportFields extends Component {
  @service featureToggles;

  @action
  onChangeSubcategory(event) {
    this.args.inChallengeCategory.subcategory = event.target.value;
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
  ].map((subcategoryKey) => {
    const subcategory = certificationIssueReportSubcategories[subcategoryKey];
    let labelForSubcategory = subcategoryToLabel[subcategory];
    if (
      subcategory === certificationIssueReportSubcategories.FILE_NOT_OPENING &&
      !this.featureToggles.featureToggles.isCertificationFreeFieldsDeletionEnabled
    ) {
      labelForSubcategory = "Le fichier à télécharger ne s'ouvre pas";
    }
    return {
      value: certificationIssueReportSubcategories[subcategory],
      label: `${subcategoryToCode[subcategory]} ${labelForSubcategory}`,
    };
  });
}
