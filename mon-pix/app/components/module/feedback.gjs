import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { tracked } from '@glimmer/tracking';

import { htmlUnsafe } from '../../helpers/html-unsafe';

export default class ModulixFeedback extends Component {
  @service featureToggles;
  @tracked feedbackModalOpen = false;
  @service modulixIssueReportModal;

  get type() {
    return this.args.answerIsValid ? 'success' : 'error';
  }

  @action
  showModal() {
    this.modulixIssueReportModal.showModal({});
  }

  @action
  onFeedbackModalClose() {
    this.feedbackModalOpen = false;
  }


  <template>
    <div class="feedback feedback--{{this.type}}">
      {{#if @feedback.state}}
        <div class="feedback__state">{{htmlUnsafe @feedback.state}}</div>
      {{/if}}
      {{htmlUnsafe @feedback.diagnosis}}

      {{#if this.featureToggles.featureToggles.isModulixIssueReportDisplayed}}
        <PixButton
          class="feedback__report-button"
          @variant="tertiary"
          @iconBefore="flag"
          aria-label={{t "pages.modulix.issue-report.aria-label"}}
          @triggerAction={{this.showModal}}
        >{{t "pages.modulix.issue-report.button"}}</PixButton>
      {{/if}}
    </div>
  </template>
}
