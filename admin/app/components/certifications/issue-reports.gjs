import CertificationIssueReport from './issue-report';

<template>
  {{#if @hasImpactfulIssueReports}}
    <h3 class="certification-issue-reports__subtitle certification-issue-reports__subtitle--with-action-required">
      {{@impactfulCertificationIssueReports.length}}
      Signalement(s) impactant(s)
    </h3>
    <ul class="certification-issue-reports__list">
      {{#each @impactfulCertificationIssueReports as |issueReport|}}
        <CertificationIssueReport @issueReport={{issueReport}} @resolveIssueReport={{@resolveIssueReport}} />
      {{/each}}
    </ul>
  {{/if}}
  {{#if @hasUnimpactfulIssueReports}}
    <h3 class="certification-issue-reports__subtitle certification-issue-reports__subtitle--without-action-required">
      {{@unimpactfulCertificationIssueReports.length}}
      Signalement(s) non impactant(s)
    </h3>
    <ul class="certification-issue-reports__list certification-issue-reports__list--last">
      {{#each @unimpactfulCertificationIssueReports as |issueReport|}}
        <CertificationIssueReport @issueReport={{issueReport}} />
      {{/each}}
    </ul>
  {{/if}}
</template>
