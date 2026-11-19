import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { runTask } from 'ember-lifeline';
import not from 'ember-truth-helpers/helpers/not';
import LiveAlert from 'mon-pix/components/assessments/live-alert';
import FeedbackWrapper from 'mon-pix/components/challenge/feedback/feedback-wrapper';

export default class CertificationFeedbackPanel extends Component {
  <template>
    {{#if this.isAssessmentPaused}}
      <LiveAlert />
    {{else}}
      <FeedbackWrapper
        @triggerAction={{this.toggleFeedbackForm}}
        @isDisabled={{not @isEnabled}}
        @isAriaExpanded={{this.isAriaExpanded}}
        @isToggleFeedbackFormHidden={{this.isToggleFeedbackFormHidden}}
      >
        <:form>
          {{#if this.shouldBeExpanded}}
            <div class="certification-feedback-panel__view">
              <p>{{t "components.challenge.feedback.certification.description"}}</p>
              <div class="certification-feedback-panel__action-buttons">
                <button type="button" {{on "click" this.submitLiveAlert}}>
                  {{t "components.challenge.feedback.certification.actions.send-feedback"}}
                </button>
                <button type="button" {{on "click" this.toggleFeedbackForm}}>
                  {{t "components.challenge.feedback.certification.actions.no-send-feedback"}}
                </button>
              </div>
            </div>
            <p class="certification-feedback-panel__information">{{t
                "components.challenge.feedback.certification.information"
              }}</p>
          {{/if}}
        </:form>
      </FeedbackWrapper>
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
