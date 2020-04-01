import { classNames } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import $ from 'jquery';
import config from 'mon-pix/config/environment';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

import { topLevelLabels, questions } from 'mon-pix/static-data/feedback-panel-issue-labels';

@classic
@classNames('feedback-panel')
export default class FeedbackPanel extends Component {
  @service store;

  assessment = null;
  challenge = null;
  isFormOpened = false;
  _content = null;
  _category = null;
  _error = null;
  _isSubmitted = false;
  nextCategory = null;
  quickHelpInstructions = null;
  displayTextBox = null;
  displayQuestionDropdown = false;
  _questions = questions;

  @computed('context')
  get categories() {
    const context = this.context === 'comparison-window' ? 'displayOnlyOnChallengePage' : 'displayOnlyOnComparisonWindow';
    return topLevelLabels.filter((label) => !label[context]);
  }

  _scrollToPanel() {
    $('html,body').animate({
      scrollTop: $('.feedback-panel__view').offset().top - 15
    }, config.APP.SCROLL_DURATION);
  }

  _resetPanel() {
    this.set('_isSubmitted', false);
    this.set('_error', null);
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

  @action
  toggleFeedbackForm() {
    if (this.isFormOpened) {
      this.set('isFormOpened', false);
      this._resetPanel();
    } else {
      this.set('isFormOpened', true);
      this._scrollToPanel();
    }
  }

  @action
  async sendFeedback() {
    const content = this._content;
    const category = this._category;
    const answer = this.answer ? this.answer.value : null;

    if (isEmpty(content) || isEmpty(content.trim())) {
      this.set('_error', 'Vous devez saisir un message.');
      return;
    }

    const feedback = this.store.createRecord('feedback', {
      content,
      category,
      assessment: this.assessment,
      challenge: this.challenge,
      answer,
    });

    await feedback.save();

    this.set('_isSubmitted', true);
    this.set('_content', null);
    this.set('_category', null);
    this.set('nextCategory', null);
    this.set('displayTextBox', false);
    this.set('tutorialContent', null);
    this.set('displayQuestionDropdown', false);
  }

  @action
  displayCategoryOptions() {
    this.set('displayTextBox', false);
    this.set('quickHelpInstructions', null);
    this.set('_error', null);
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
      this.set('_error', null);
    }

    this.set('_error', null);
    this.set('_category', this.nextCategory[event.target.value].name);
    this._showFeedbackActionBasedOnCategoryType(this.nextCategory[event.target.value]);
  }
}
