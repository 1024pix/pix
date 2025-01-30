import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class IssueReportsModal extends Component {
  @tracked showDeletionError = false;

  @action
  async handleClickOnDeleteButton(issueReport) {
    this.showDeletionError = false;
    try {
      await this.args.onClickDeleteIssueReport(issueReport);
    } catch {
      this.showDeletionError = true;
    }
  }
}
