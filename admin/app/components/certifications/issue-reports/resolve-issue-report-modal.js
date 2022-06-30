import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CertificationIssueReportModal extends Component {
  @service notifications;

  @tracked label = null;

  @action
  resolve() {
    this.args.resolveIssueReport(this.args.issueReport, this.label);
    this.args.closeResolveModal();
  }

  @action
  onChangeLabel(event) {
    this.label = event.target.value;
  }

  get title() {
    return this.args.issueReport.isResolved ? 'Modifier le signalement' : 'Résoudre un signalement';
  }

  get buttonName() {
    return this.args.issueReport.isResolved ? 'Modifier le signalement' : 'Résoudre le signalement';
  }
}
