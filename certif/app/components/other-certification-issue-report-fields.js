import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { certificationIssueReportCategories } from 'pix-certif/models/certification-issue-report';
import { action } from '@ember/object';

class RadioButtonCategory {
  @tracked isChecked;
  @tracked name;

  constructor() {
    this.isChecked = false;
  }
}

export default class OtherCertificationissueReportFields extends Component {
  @tracked otherCategory = new RadioButtonCategory();
  @tracked reportLength = 0;

  constructor() {
    super(...arguments);
    this.otherCategory.isChecked = false;
    this.otherCategory.name = certificationIssueReportCategories.OTHER;
  }

  @action
  handleTextareaChange(e) {
    this.reportLength = e.target.value.length;
  }
}
