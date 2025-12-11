import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ModulixIssueReportModal extends Service {
  @tracked elementId = null;
  @tracked grainId = null;
  @tracked answer = null;
  @tracked issueReportModalDisplayed = false;

  showModal({ elementId, grainId, answer }) {
    this.elementId = elementId;
    this.grainId = grainId;
    this.answer = answer;

    this.issueReportModalDisplayed = true;
  }

  closeModal() {
    this.elementId = null;
    this.grainId = null;
    this.answer = null;

    this.issueReportModalDisplayed = false;
  }
}
