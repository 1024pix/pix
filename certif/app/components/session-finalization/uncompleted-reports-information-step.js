import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/string';

export default class UncompletedReportsInformationStep extends Component {

  @tracked reportToEdit = null;
  @tracked showAddIssueReportModal = false;
  @tracked showIssueReportsModal = false;

  get certifReportsAreNotEmpty() {
    return this.args.certificationReports.length !== 0;
  }

  get cancelOptions() {
    return [
      { label: 'Abandon du candidat', value: 'candidate' },
      { label: 'Problème technique', value: 'technical' },
    ];
  }

  @action
  openAddIssueReportModal(report) {
    this.showIssueReportsModal = false;
    this.showAddIssueReportModal = true;
    this.reportToEdit = report;
  }

  @action
  openIssueReportsModal(report) {
    this.showAddIssueReportModal = false;
    this.showIssueReportsModal = true;
    this.reportToEdit = report;
  }

  @action
  closeAddIssueReportModal() {
    this.showAddIssueReportModal = false;
  }

  @action
  closeIssueReportsModal() {
    this.showIssueReportsModal = false;
  }

  get tooltipMessage() {
    const html = '<ul><li>Abandon du candidat :<ul><li>Le candidat est parti avant la fin de son test</li><li>Le candidat n\'est pas parvenu à répondre à l\'ensemble des questions du test dans le temps imparti, et n\'a pas passé les questions restantes jusqu\'à arriver à l\'écran de fin de test</li></ul><li>Problème technique :<ul><li>Problème technique sur la plateforme Pix, ou lié au réseau du centre de certification</li></ul></li></ul>';

    return htmlSafe(html);
  }

}
