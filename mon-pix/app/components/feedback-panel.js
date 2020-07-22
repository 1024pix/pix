import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import _ from 'lodash';

import buttonStatusTypes from 'mon-pix/utils/button-status-types';
import { topLevelLabels, questions } from 'mon-pix/static-data/feedback-panel-issue-labels';

export default class FeedbackPanel extends Component {
  @service store;

  @tracked content = null;
  @tracked displayQuestionDropdown = false;
  @tracked displayTextBox = false;
  @tracked emptyTextBoxMessageError = null;
  @tracked isFormOpened = false;
  @tracked isFormSubmitted = false;
  @tracked nextCategory = null;
  @tracked quickHelpInstructions = null;

  _category = null;
  _questions = questions;
  _sendButtonStatus = buttonStatusTypes.unrecorded;

  constructor(owner, args) {
    super(owner, args);
    this._resetPanel();
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
    if (this.isFormOpened) {
      this.isFormOpened = false;
      this._resetPanel();
    } else {
      this.isFormOpened = true;
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
      this.emptyTextBoxMessageError = 'Vous devez saisir un message.';
      return;
    }

    const feedback = this.store.createRecord('feedback', {
      content: this.content,
      category: this._category,
      assessment: this.args.assessment,
      challenge: this.args.challenge,
      answer: _.get(this.args, 'answer.value', null),
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

    this.nextCategory = this._questions[event.target.value];
    this._category = event.target.value;

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
      this.isFormOpened = true;
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
    }
  }

  _scrollIntoFeedbackPanel() {
    const feedbackPanelElements = document.getElementsByClassName('feedback-panel__view');
    if (feedbackPanelElements && feedbackPanelElements[0]) {
      feedbackPanelElements[0].scrollIntoView();
    }
  }

  get _isComparisonWindowContext() {
    return this.args.context && this.args.context === 'comparison-window';
  }

}
