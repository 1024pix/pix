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

  get categoryCode() {
    // Les services (injectés) ne peuvent etre utilisés dans des constructeurs.
    // Ce getter pourra etre supprimé et remplacé par @inChallengeCategory.categoryCode dans le template
    // avec la suppression du toggle
    if (!this.featureToggles.featureToggles.isCertificationFreeFieldsDeletionEnabled) {
      return 'E1-E10';
    }
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
    'SKIP_ON_OUPS',
    'ACCESSIBILITY_ISSUE',
  ]
    .map((subcategoryKey) => {
      const subcategory = certificationIssueReportSubcategories[subcategoryKey];
      let labelForSubcategory = subcategoryToLabel[subcategory];
      if (!this.featureToggles.featureToggles.isCertificationFreeFieldsDeletionEnabled) {
        if (subcategory === certificationIssueReportSubcategories.FILE_NOT_OPENING) {
          labelForSubcategory = "Le fichier à télécharger ne s'ouvre pas";
        }
        if (
          subcategory === certificationIssueReportSubcategories.SKIP_ON_OUPS ||
          subcategory === certificationIssueReportSubcategories.ACCESSIBILITY_ISSUE
        ) {
          return null;
        }
      }
      return {
        value: certificationIssueReportSubcategories[subcategory],
        label: `${subcategoryToCode[subcategory]} ${labelForSubcategory}`,
      };
    })
    .filter(Boolean);
}
