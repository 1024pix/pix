import { action } from '@ember/object';
import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

import buttonStatusTypes from 'mon-pix/utils/button-status-types';
import { topLevelLabels, questions } from 'mon-pix/static-data/feedback-panel-issue-labels';

export default class FeedbackPanel extends Component {
  @service store;
  @service intl;

  @tracked content = null;
  @tracked displayQuestionDropdown = false;
  @tracked displayTextBox = false;
  @tracked emptyTextBoxMessageError = null;
  @tracked isFormSubmitted = false;
  @tracked nextCategory = null;
  @tracked quickHelpInstructions = null;
  @tracked isExpanded = false;
  _category = null;
  _questions = questions;
  _sendButtonStatus = buttonStatusTypes.unrecorded;
  _currentMajorCategory = null;

  constructor(owner, args) {
    super(owner, args);
    this._resetPanel();
  }

  get isAriaExpanded() {
    return this.isExpanded ? 'true' : 'false';
  }

  get feedbackPanelId() {
    return this.isFormSubmitted ? 'feedback-panel-submitted' : 'feedback-panel';
  }

  get categories() {
    const context = this._isComparisonWindowContext ? 'displayOnlyOnChallengePage' : 'displayOnlyOnComparisonWindow';
    return topLevelLabels.filter((label) => !label[context]);
  }

  get isSendButtonDisabled() {
    return this._sendButtonStatus === buttonStatusTypes.pending;
  }

  get isToggleFeedbackFormDisabled() {
    return this.args.alwaysOpenForm;
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
  async sendFeedback(event) {
    event && event.preventDefault();

    if (this.isSendButtonDisabled) {
      return;
    }
    this._sendButtonStatus = buttonStatusTypes.pending;
    const content = this.content;

    if (isEmpty(content) || isEmpty(content.trim())) {
      this._sendButtonStatus = buttonStatusTypes.unrecorded;
      this.emptyTextBoxMessageError = this.intl.t('pages.challenge.feedback-panel.form.status.error.empty-message');
      return;
    }

    const category = this._category
      ? this.intl.t(this._category)
      : this.intl.t(
          'pages.challenge.feedback-panel.form.fields.category-selection.options.' + this._currentMajorCategory
        );
    const feedback = this.store.createRecord('feedback', {
      content: this.content,
      category,
      assessment: this.args.assessment,
      challenge: this.args.challenge,
      answer: get(this.args, 'answer.value', null),
    });

    try {
      await feedback.save();
      this.isFormSubmitted = true;
      this._sendButtonStatus = buttonStatusTypes.recorded;
      this._resetForm();
    } catch (error) {
      this._sendButtonStatus = buttonStatusTypes.unrecorded;
    }
  }

  @action
  displayCategoryOptions() {
    this.displayTextBox = false;
    this.quickHelpInstructions = null;
    this.emptyTextBoxMessageError = null;
    this.displayQuestionDropdown = false;
    this._category = null;

    this._currentMajorCategory = event.target.value;
    this.nextCategory = this._questions[this._currentMajorCategory];

    if (this.nextCategory.length > 1) {
      this.displayQuestionDropdown = true;
    } else {
      this._showFeedbackActionBasedOnCategoryType(this.nextCategory[0]);
    }
  }

  @action
  showFeedback() {
    if (event.target.value === 'default') {
      this.displayTextBox = false;
      this.quickHelpInstructions = null;
      this.emptyTextBoxMessageError = null;
    }
    this.emptyTextBoxMessageError = null;
    this._category = this.nextCategory[event.target.value].name;
    this._showFeedbackActionBasedOnCategoryType(this.nextCategory[event.target.value]);
  }

  _resetPanel() {
    this.isFormSubmitted = false;
    this.emptyTextBoxMessageError = null;
    this._resetForm();
    if (this.args.alwaysOpenForm) {
      this.isExpanded = true;
    }
  }

  _resetForm() {
    this.content = null;
    this._category = null;
    this.nextCategory = null;
    this.displayTextBox = false;
    this.tutorialContent = null;
    this.displayQuestionDropdown = false;
  }

  _showFeedbackActionBasedOnCategoryType(category) {
    this.displayTextBox = false;
    this.quickHelpInstructions = null;

    if (category.type === 'tutorial') {
      this.quickHelpInstructions = category.content;
    } else if (category.type === 'textbox') {
      this.displayTextBox = true;
    } else if (category.type === 'tutorialAndTextbox') {
      this.quickHelpInstructions = category.content;
      this.displayTextBox = true;
    }
  }

  _scrollIntoFeedbackPanel() {
    later(function () {
      const feedbackPanelElements = document.getElementsByClassName('feedback-panel__view');
      if (feedbackPanelElements && feedbackPanelElements[0]) {
        feedbackPanelElements[0].scrollIntoView();
      }
    });
  }

  get _isComparisonWindowContext() {
    return this.args.context && this.args.context === 'comparison-window';
  }
}
