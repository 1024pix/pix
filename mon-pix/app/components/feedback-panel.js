/* eslint ember/no-classic-components: 0 */
/* eslint ember/no-component-lifecycle-hooks: 0 */
/* eslint ember/require-tagless-components: 0 */

import { classNames } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import buttonStatusTypes from 'mon-pix/utils/button-status-types';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

import { topLevelLabels, questions } from 'mon-pix/static-data/feedback-panel-issue-labels';

@classic
@classNames('feedback-panel')
export default class FeedbackPanel extends Component {
  @service store;

  assessment = null;
  challenge = null;

  displayQuestionDropdown = false;
  displayTextBox = null;
  emptyTextBoxMessageError = null;
  nextCategory = null;
  isFormOpened = false;
  quickHelpInstructions = null;
  sendButtonStatus = buttonStatusTypes.unrecorded;

  _category = null;
  _content = null;
  _isSubmitted = false;
  _questions = questions;

  @computed('context')
  get categories() {
    const context = this.context === 'comparison-window' ? 'displayOnlyOnChallengePage' : 'displayOnlyOnComparisonWindow';
    return topLevelLabels.filter((label) => !label[context]);
  }

  get isSendButtonDisabled() {
    return this.sendButtonStatus === buttonStatusTypes.pending;
  }

  _resetPanel() {
    this.set('_isSubmitted', false);
    this.set('emptyTextBoxMessageError', null);
  }

  didReceiveAttrs() {
    super.didReceiveAttrs();
    this._resetPanel();
    this.set('_content', null);
  }

  _showFeedbackActionBasedOnCategoryType(category) {
    this.set('displayTextBox', false);
    this.set('quickHelpInstructions', null);

    if (category.type === 'tutorial') {
      this.set('quickHelpInstructions', category.content);
    } else if (category.type === 'textbox') {
      this.set('displayTextBox', true);
    }
  }

  _scrollIntoFeedbackPanel() {
    const feedbackPanelElements = document.getElementsByClassName('feedback-panel__view');
    if (feedbackPanelElements && feedbackPanelElements[0]) {
      feedbackPanelElements[0].scrollIntoView();
    }
  }

  @action
  toggleFeedbackForm() {
    if (this.isFormOpened) {
      this.set('isFormOpened', false);
      this._resetPanel();
    } else {
      this.set('isFormOpened', true);
      this._scrollIntoFeedbackPanel();
    }
  }

  @action
  async sendFeedback() {
    if (this.isSendButtonDisabled) {
      return;
    }
    this.set('sendButtonStatus', buttonStatusTypes.pending);
    const content = this._content;
    const category = this._category;
    const answer = this.answer ? this.answer.value : null;

    if (isEmpty(content) || isEmpty(content.trim())) {
      this.set('emptyTextBoxMessageError', 'Vous devez saisir un message.');
      return;
    }

    const feedback = this.store.createRecord('feedback', {
      content,
      category,
      assessment: this.assessment,
      challenge: this.challenge,
      answer,
    });

    try {
      await feedback.save();
      this.set('_isSubmitted', true);
      this.set('_content', null);
      this.set('_category', null);
      this.set('nextCategory', null);
      this.set('displayTextBox', false);
      this.set('tutorialContent', null);
      this.set('displayQuestionDropdown', false);
      this.set('sendButtonStatus', buttonStatusTypes.recorded);
    } catch (error) {
      this.set('sendButtonStatus', buttonStatusTypes.unrecorded);
    }
  }

  @action
  displayCategoryOptions() {
    this.set('displayTextBox', false);
    this.set('quickHelpInstructions', null);
    this.set('emptyTextBoxMessageError', null);
    this.set('displayQuestionDropdown', false);

    this.set('nextCategory', this._questions[event.target.value]);
    this.set('_category', event.target.value);

    if (this.nextCategory.length > 1) {
      this.set('displayQuestionDropdown', true);
    } else {
      this._showFeedbackActionBasedOnCategoryType(this.nextCategory[0]);
    }
  }

  @action
  showFeedback() {
    if (event.target.value === 'default') {
      this.set('displayTextBox', false);
      this.set('quickHelpInstructions', null);
      this.set('emptyTextBoxMessageError', null);
    }

    this.set('emptyTextBoxMessageError', null);
    this.set('_category', this.nextCategory[event.target.value].name);
    this._showFeedbackActionBasedOnCategoryType(this.nextCategory[event.target.value]);
  }
}
