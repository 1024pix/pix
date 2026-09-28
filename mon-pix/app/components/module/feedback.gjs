import { PixButton } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import { htmlUnsafe } from '../../helpers/html-unsafe';
import ModulixIssueReportBlock from './issue-report/issue-report-block';

export default class ModulixFeedback extends Component {
  get type() {
    if (this.args.answerIsValid === undefined) {
      return 'info';
    }
    return this.args.answerIsValid ? 'success' : 'error';
  }

  <template>
    <div class="feedback feedback--{{this.type}}" role="status" tabindex="-1">
      <div class="feedback__content {{if @shouldDisplayRetryButton 'feedback__content--with-retry-button'}}">
        {{#if @feedback.state}}
          <p class="feedback-content__state">{{htmlUnsafe @feedback.state}}</p>
        {{/if}}
        {{htmlUnsafe @feedback.diagnosis}}

      </div>
      <div class="feedback__buttons">
        {{#if @reportInfo}}
          <ModulixIssueReportBlock @reportInfo={{@reportInfo}} />
        {{/if}}
        {{#if @shouldDisplayRetryButton}}
          <PixButton
            class="feedback-buttons__retry"
            @variant="tertiary"
            @triggerAction={{@retry}}
            @iconBefore="refresh"
          >
            {{t "pages.modulix.buttons.activity.retry"}}
          </PixButton>
        {{/if}}
      </div>
    </div>
  </template>
}
