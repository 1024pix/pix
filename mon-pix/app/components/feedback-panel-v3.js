import { action } from '@ember/object';
import { later } from '@ember/runloop';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class FeedbackPanelV3 extends Component {
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
    return this.args.assessment.hasOngoingLiveAlert;
  }

  get shouldBeExpanded() {
    return this.isAssessmentPaused || this.isExpanded;
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
  resfreshPage() {
    this.router.refresh();
  }

  _resetPanel() {
    this.isExpanded = false;
  }

  _scrollIntoFeedbackPanel() {
    later(function () {
      const feedbackPanelElements = document.getElementsByClassName('feedback-panel-v3');
      if (feedbackPanelElements && feedbackPanelElements[0]) {
        feedbackPanelElements[0].scrollIntoView();
      }
    });
  }
}
