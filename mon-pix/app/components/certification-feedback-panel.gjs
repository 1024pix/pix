import { PixButton } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { runTask } from 'ember-lifeline';
import not from 'ember-truth-helpers/helpers/not';
import LiveAlert from 'mon-pix/components/assessments/live-alert';

export default class CertificationFeedbackPanel extends Component {
  <template>
    {{! template-lint-disable require-input-label no-unknown-arguments-for-builtin-components }}
    {{#if this.isAssessmentPaused}}
      <LiveAlert @message={{t "pages.challenge.live-alerts.challenge.message"}} />
    {{else}}
      <div class="certification-feedback-panel">
        <h2 class="screen-reader-only">{{t "pages.challenge.parts.feedback-v3"}}</h2>

        {{#unless this.isToggleFeedbackFormHidden}}
          <PixButton
            @variant="tertiary"
            @triggerAction={{this.toggleFeedbackForm}}
            @isDisabled={{not @isEnabled}}
            aria-expanded={{this.isAriaExpanded}}
            @iconBefore="flag"
          >
            {{t "pages.challenge.certification-feedback-panel.actions.open-close"}}
          </PixButton>
        {{/unless}}

        {{#if this.shouldBeExpanded}}
          <div class="certification-feedback-panel__view">
            {{t "pages.challenge.certification-feedback-panel.description"}}
            <div class="certification-feedback-panel__action-buttons">
              <button type="button" {{on "click" this.submitLiveAlert}}>
                {{t "pages.challenge.certification-feedback-panel.actions.send-feedback"}}
              </button>
              <button type="button" {{on "click" this.toggleFeedbackForm}}>
                {{t "pages.challenge.certification-feedback-panel.actions.no-send-feedback"}}
              </button>
            </div>
          </div>
          <p class="certification-feedback-panel__information">{{t
              "pages.challenge.certification-feedback-panel.information"
            }}</p>
        {{/if}}
      </div>
    {{/if}}
  </template>
  @service store;
  @service router;
  @service intl;
  @tracked isExpanded = false;

  constructor(owner, args) {
    super(owner, args);
    this._resetPanel();
  }

  get isAriaExpanded() {
    return this.isAssessmentPaused || this.isExpanded ? 'true' : 'false';
  }

  get isAssessmentPaused() {
    return this.args.assessment.hasOngoingChallengeLiveAlert;
  }

  get shouldBeExpanded() {
    return this.args.isEnabled && (this.isAssessmentPaused || this.isExpanded);
  }

  get isToggleFeedbackFormHidden() {
    return this.args.assessment.hasOngoingChallengeLiveAlert;
  }

  @action
  toggleFeedbackForm() {
    if (this.isExpanded) {
      this.isExpanded = false;
      this._resetPanel();
    } else {
      this.isExpanded = true;
      this._scrollIntoFeedbackPanel();
    }
  }

  @action
  submitLiveAlert() {
    this.args.submitLiveAlert();
    this._resetPanel();
  }

  _resetPanel() {
    this.isExpanded = false;
  }

  _scrollIntoFeedbackPanel() {
    runTask(this, function () {
      const feedbackPanelElements = document.getElementsByClassName('certification-feedback-panel');
      if (feedbackPanelElements && feedbackPanelElements[0]) {
        feedbackPanelElements[0].scrollIntoView();
      }
    });
  }
}
