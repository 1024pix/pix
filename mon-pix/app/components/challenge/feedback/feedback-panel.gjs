import { PixButton, PixModal, PixNotificationAlert, PixSelect, PixTextarea } from '@1024pix/nebulix-ember';
import { hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { runTask } from 'ember-lifeline';
import get from 'lodash/get';
import FeedbackWrapper from 'mon-pix/components/challenge/feedback/feedback-wrapper';
import { questions, topLevelLabels } from 'mon-pix/static-data/feedback-panel-issue-labels';
import buttonStatusTypes from 'mon-pix/utils/button-status-types';

export default class FeedbackPanel extends Component {
  @service store;
  @service intl;

  @tracked content = null;
  @tracked displayQuestionDropdown = false;
  @tracked displayTextBox = false;
  @tracked displayAddCommentButton = true;
  @tracked isFormSubmitted = false;
  @tracked nextCategory = null;
  @tracked quickHelpInstructions = null;
  @tracked isExpanded = false;
  @tracked isModalVisible = false;
  @tracked _currentMajorCategory = null;
  @tracked _currentNextCategory = null;
  _category = null;
  _questions = questions;
  _sendButtonStatus = buttonStatusTypes.unrecorded;

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

  filteredCategories() {
    const context = this._isComparisonWindowContext ? 'displayOnlyOnChallengePage' : 'displayOnlyOnComparisonWindow';
    return topLevelLabels.filter((label) => !label[context]);
  }

  @action
  setContent(event) {
    this.content = event.target.value;
  }

  get categories() {
    return this.filteredCategories().map((category) => ({ value: category.value, label: this.intl.t(category.name) }));
  }

  get nextCategories() {
    return this.nextCategory.map((question, index) => ({
      value: index + 1,
      label: this.intl.t(question.name),
    }));
  }

  get isSendButtonDisabled() {
    return this._sendButtonStatus === buttonStatusTypes.pending;
  }

  get isToggleFeedbackFormDisabled() {
    return this.args.alwaysOpenForm;
  }

  @action
  toggleFeedbackForm() {
    if (this.isToggleFeedbackFormDisabled) return;
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

    const category = this._category
      ? this.intl.t(this._category)
      : this.intl.t(
          'components.challenge.feedback.common.form.fields.category-selection.options.' + this._currentMajorCategory,
        );

    const feedback = this.store.createRecord('feedback', {
      content: this.content || '',
      category,
      assessment: await this.args.assessment,
      challenge: await this.args.challenge,
      answer: get(this.args, 'answer.value', null),
    });

    try {
      await feedback.save();
      this.isFormSubmitted = true;
      this._sendButtonStatus = buttonStatusTypes.recorded;
      this._resetForm();
      this.toggleModalVisibility();
    } catch {
      this._sendButtonStatus = buttonStatusTypes.unrecorded;
    }
  }

  @action
  displayCategoryOptions(value) {
    this.displayTextBox = false;
    this.quickHelpInstructions = null;
    this.displayQuestionDropdown = false;
    this._category = null;
    this._currentNextCategory = null;

    this._currentMajorCategory = value;
    this.nextCategory = this._questions[this._currentMajorCategory];

    if (!this.nextCategory) {
      return;
    }

    if (this.nextCategory.length > 1) {
      this.displayQuestionDropdown = true;
    } else {
      this._showFeedbackActionBasedOnCategoryType(this.nextCategory[0]);
    }
  }

  @action
  showFeedback(value) {
    if (value === '') {
      this.displayTextBox = false;
      this.quickHelpInstructions = null;
      this._currentNextCategory = null;
      return;
    }

    this._currentNextCategory = value;
    this._category = this.nextCategory[value - 1] ? this.nextCategory[value - 1].name : null;
    if (this._category != null) {
      this._showFeedbackActionBasedOnCategoryType(this.nextCategory[value - 1]);
    }
  }

  @action
  toggleModalVisibility() {
    this.isModalVisible = !this.isModalVisible;
  }

  @action
  addComment() {
    this.displayAddCommentButton = false;
  }

  _resetPanel() {
    this.isFormSubmitted = false;
    this._resetForm();
    if (this.args.alwaysOpenForm) {
      this.isExpanded = true;
    }
  }

  _resetForm() {
    this.content = null;
    this._category = null;
    this.nextCategory = null;
    this.quickHelpInstructions = null;
    this._currentMajorCategory = null;
    this.displayTextBox = false;
    this.displayAddCommentButton = true;
    this.displayQuestionDropdown = false;
  }

  _showFeedbackActionBasedOnCategoryType(category) {
    this.displayTextBox = false;
    this.quickHelpInstructions = null;
    this.displayAddCommentButton = true;

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
    runTask(this, function () {
      const feedbackPanelElements = document.getElementsByClassName('feedback-panel__view');
      if (feedbackPanelElements && feedbackPanelElements[0]) {
        feedbackPanelElements[0].scrollIntoView();
      }
    });
  }

  get _isComparisonWindowContext() {
    return this.args.context && this.args.context === 'comparison-window';
  }

  <template>
    {{! template-lint-disable require-input-label no-unknown-arguments-for-builtin-components }}
    <FeedbackWrapper
      @triggerAction={{this.toggleFeedbackForm}}
      @isDisabled={{this.isToggleFeedbackFormDisabled}}
      @isAriaExpanded={{this.isAriaExpanded}}
    >
      <:form>
        {{#if this.isExpanded}}
          {{#if this.isFormSubmitted}}
            <PixNotificationAlert @type="success" @withIcon={{true}}>
              {{t "components.challenge.feedback.common.form.status.success" htmlSafe=true}}
            </PixNotificationAlert>
          {{else}}
            <div class="feedback-panel__view" id="feedback-panel">
              <p>{{t "components.challenge.feedback.common.description"}}</p>
              <div class="feedback-panel__form-wrapper">
                <form id="feedback-form" class="feedback-panel__form" {{on "submit" this.sendFeedback}} novalidate>
                  <div class="feedback-panel__group">
                    <div class="feedback-panel__category-selection">
                      <PixSelect
                        @screenReaderOnly={{true}}
                        @texts={{hash
                          placeholder=(t "components.challenge.feedback.common.form.fields.category-selection.label")
                        }}
                        @options={{this.categories}}
                        @onChange={{this.displayCategoryOptions}}
                        @value={{this._currentMajorCategory}}
                      >
                        <:label>{{t
                            "components.challenge.feedback.common.form.fields.detail-selection.aria-first"
                          }}</:label>
                      </PixSelect>
                      {{#if this.displayQuestionDropdown}}
                        <PixSelect
                          @screenReaderOnly={{true}}
                          @texts={{hash
                            placeholder=(t "components.challenge.feedback.common.form.fields.detail-selection.label")
                          }}
                          @onChange={{this.showFeedback}}
                          @options={{this.nextCategories}}
                          @value={{this._currentNextCategory}}
                        >
                          <:label>{{t
                              "components.challenge.feedback.common.form.fields.detail-selection.aria-secondary"
                            }}</:label>
                        </PixSelect>
                      {{/if}}
                      {{#if this.quickHelpInstructions}}
                        <PixNotificationAlert @withIcon={{true}} @type="warning">
                          {{t this.quickHelpInstructions htmlSafe=true}}
                        </PixNotificationAlert>
                      {{/if}}
                    </div>
                  </div>
                  {{#if this.displayTextBox}}
                    {{#if this.displayAddCommentButton}}
                      <PixButton @iconBefore="edit" @variant="tertiary" @triggerAction={{this.addComment}}>
                        {{t "components.challenge.feedback.common.form.fields.detail-selection.add-comment"}}
                      </PixButton>
                    {{else}}
                      <div>
                        <p class="feedback-panel__field-notice">
                          {{t "components.challenge.feedback.common.form.status.error.max-characters"}}
                        </p>
                        <PixTextarea
                          class="feedback-panel__field--content"
                          @value={{this.content}}
                          @screenReaderOnly={{true}}
                          @maxlength="10000"
                          rows="5"
                          placeholder={{t
                            "components.challenge.feedback.common.form.fields.detail-selection.problem-suggestion-description"
                          }}
                          {{on "change" this.setContent}}
                        >
                          <:label>{{t
                              "components.challenge.feedback.common.form.fields.detail-selection.problem-suggestion-description"
                            }}</:label>
                        </PixTextarea>
                      </div>
                    {{/if}}
                    <PixButton
                      @triggerAction={{this.toggleModalVisibility}}
                      @isDisabled={{this.isSendButtonDisabled}}
                      aria-label={{t "components.challenge.feedback.common.form.actions.submit-aria-label"}}
                    >
                      {{t "components.challenge.feedback.common.form.actions.submit"}}
                    </PixButton>
                  {{/if}}
                </form>
              </div>

              <div class="feedback-panel__form-legal-notice">
                {{t "components.challenge.feedback.common.information.guidance" htmlSafe=true}}
                {{t "components.challenge.feedback.common.information.data-usage" htmlSafe=true}}
              </div>
            </div>
          {{/if}}
        {{/if}}
      </:form>
    </FeedbackWrapper>

    <PixModal
      @title={{t "components.challenge.feedback.common.modal.title"}}
      @showModal={{this.isModalVisible}}
      @onCloseButtonClick={{this.toggleModalVisibility}}
    >
      <:content>
        {{t "components.challenge.feedback.common.modal.content" htmlSafe=true}}
      </:content>
      <:footer>
        <PixButton @triggerAction={{this.toggleModalVisibility}} @variant="secondary">
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @type="submit" form="feedback-form">{{t "common.actions.validate"}}</PixButton>
      </:footer>
    </PixModal>
  </template>
}
