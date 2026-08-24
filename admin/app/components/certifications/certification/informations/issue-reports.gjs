import { PixBlock } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

import CertificationIssueReport from './issue-reports/issue-report';

export default class CertificationInformationIssueReports extends Component {
  get impactfulCertificationIssueReports() {
    return this.args.certificationIssueReports.filter((issueReport) => issueReport.isImpactful);
  }

  get unimpactfulCertificationIssueReports() {
    return this.args.certificationIssueReports.filter((issueReport) => !issueReport.isImpactful);
  }

  <template>
    <PixBlock @variant="admin">
      <h2 class="certification-information__title certification-issue-reports__title">Signalements</h2>
      {{#if this.impactfulCertificationIssueReports.length}}
        <h3 class="certification-issue-reports__subtitle certification-issue-reports__subtitle--with-action-required">
          {{this.impactfulCertificationIssueReports.length}}
          Signalement(s) impactant(s)
        </h3>
        <ul class="certification-issue-reports__list">
          {{#each this.impactfulCertificationIssueReports as |issueReport|}}
            <CertificationIssueReport @issueReport={{issueReport}} @certification={{@certification}} />
          {{/each}}
        </ul>
      {{/if}}
      {{#if this.unimpactfulCertificationIssueReports.length}}
        <h3
          class="certification-issue-reports__subtitle certification-issue-reports__subtitle--without-action-required"
        >
          {{this.unimpactfulCertificationIssueReports.length}}
          Signalement(s) non impactant(s)
        </h3>
        <ul class="certification-issue-reports__list certification-issue-reports__list--last">
          {{#each this.unimpactfulCertificationIssueReports as |issueReport|}}
            <CertificationIssueReport @issueReport={{issueReport}} />
          {{/each}}
        </ul>
      {{/if}}
    </PixBlock>
  </template>
}
