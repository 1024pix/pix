import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class CertificationIssueReportModal extends Component {
  @service notifications;

  @action
  resolve() {
    this.args.resolveIssueReport(this.args.issueReport, 'resolved!');
    this.args.closeResolveModal();
  }
}
