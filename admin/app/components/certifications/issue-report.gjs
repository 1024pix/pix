import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { and, not, or } from 'ember-truth-helpers';

import CertificationIssueReportModal from './issue-reports/resolve-issue-report-modal';

export default class CertificationIssueReport extends Component {
  @service notifications;
  @service accessControl;

  @tracked showResolveModal = false;

  @action
  toggleResolveModal() {
    this.showResolveModal = !this.showResolveModal;
  }

  @action
  closeResolveModal() {
    this.showResolveModal = false;
  }

  <template>
    <li class="certification-issue-report">
      {{#if (or (not @issueReport.isImpactful) @issueReport.resolvedAt)}}
        <FaIcon
          aria-label="Signalement résolu"
          aria-hidden="false"
          class="certification-issue-report__resolution-status--resolved"
          @icon="circle-check"
        />
      {{else}}
        <FaIcon
          aria-label="Signalement non résolu"
          aria-hidden="false"
          class="certification-issue-report__resolution-status--unresolved"
          @icon="circle-xmark"
        />
      {{/if}}

      <div class="certification-issue-report__details">
        <div class="certification-issue-report__details__label">
          {{@issueReport.categoryLabel}}
          {{#if @issueReport.subcategoryLabel}} : {{@issueReport.subcategoryLabel}}{{/if}}
          {{#if @issueReport.description}} - {{@issueReport.description}}{{/if}}
          {{#if @issueReport.questionNumber}} - Question {{@issueReport.questionNumber}}{{/if}}
        </div>
        {{#if (and @issueReport.isImpactful @issueReport.resolvedAt)}}
          <div class="certification-issue-report__details__resolution-message">
            Résolution :
            {{#if @issueReport.resolution}}{{@issueReport.resolution}}{{else}}-{{/if}}
          </div>
        {{/if}}
      </div>
      {{#if this.accessControl.hasAccessToCertificationActionsScope}}
        {{#if @issueReport.canBeResolved}}
          <PixButton @size="small" @triggerAction={{this.toggleResolveModal}}>Résoudre le signalement</PixButton>
        {{/if}}
        {{#if @issueReport.canBeModified}}
          <PixButton @size="small" @triggerAction={{this.toggleResolveModal}}>Modifier la résolution</PixButton>
        {{/if}}
        <CertificationIssueReportModal
          @toggleResolveModal={{this.toggleResolveModal}}
          @issueReport={{@issueReport}}
          @resolveIssueReport={{@resolveIssueReport}}
          @closeResolveModal={{this.closeResolveModal}}
          @displayModal={{this.showResolveModal}}
        />
      {{/if}}
    </li>
  </template>
}
