import { PixButton } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import ModulixIssueReportModal from './issue-report-modal';

export default class ModulixIssueReportBlock extends Component {
  @tracked showModal = false;
  @tracked sentStatus = null;
  @service moduleIssueReport;

  @action
  onReportClick() {
    this.showModal = true;
    this.sentStatus = null;
  }

  @action
  hideModal() {
    this.showModal = false;
  }

  @action
  async onSend({ categoryKey, comment }) {
    try {
      await this.moduleIssueReport.record({
        categoryKey,
        comment,
        elementId: this.args.reportInfo.elementId,
        answer: this.args.reportInfo.answer,
      });
      this.sentStatus = 'success';
    } catch {
      this.sentStatus = 'error';
    }
  }

  <template>
    <PixButton
      class="feedback__report-button"
      @variant="tertiary"
      @iconBefore="flag"
      aria-label={{t "pages.modulix.issue-report.aria-label"}}
      @triggerAction={{this.onReportClick}}
    >{{t "pages.modulix.issue-report.button"}}</PixButton>
    <ModulixIssueReportModal
      @elementType={{@reportInfo.elementType}}
      @showModal={{this.showModal}}
      @hideModal={{this.hideModal}}
      @onSendReport={{this.onSend}}
      @sentStatus={{this.sentStatus}}
    />
  </template>
}
