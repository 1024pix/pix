import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CertificationIssueReportModal extends Component {
  @tracked label = null;
  @tracked errorMessage = null;

  @action
  resolve() {
    if (this._isInvalid()) {
      this.errorMessage = 'Le motif de résolution doit être renseigné.';
      return;
    }

    this.errorMessage = null;
    this.args.resolveIssueReport(this.args.issueReport, this.label);
    this.args.closeResolveModal();
  }

  @action
  onChangeLabel(event) {
    this.label = event.target.value;
  }

  get actionName() {
    return this.args.issueReport.isResolved ? 'Modifier la résolution' : 'Résoudre ce signalement';
  }

  _isInvalid() {
    return this.args.issueReport.isResolved && !this.label?.trim();
  }
}
