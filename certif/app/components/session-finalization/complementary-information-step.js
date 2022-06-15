import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CompletedReportsInformationStep extends Component {
  @tracked displayIncidentDuringCertificationSession = false;
  @tracked displayJoiningIssue = false;

  @action
  onCheckIncidentDuringCertificationSession(event) {
    this.displayIncidentDuringCertificationSession = event.target.checked;
    this.args.toggleIncidentDuringCertificationSession(this.displayIncidentDuringCertificationSession);
  }

  @action
  onCheckIssueWithJoiningSession(event) {
    this.displayJoiningIssue = event.target.checked;
    this.args.toggleSessionJoiningIssue(this.displayJoiningIssue);
  }
}
