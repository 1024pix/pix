import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class IssueReportsModal extends Component {
  @tracked showDeletionError = false;

  @action
  async handleClickOnDeleteButton(issueReport) {
    this.showDeletionError = false;
    try {
      await this.args.onClickDeleteIssueReport(issueReport);
    } catch (err) {
      this.showDeletionError = true;
    }
  }
}
